from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, HttpUrl
from fastapi.middleware.cors import CORSMiddleware
from bs4 import BeautifulSoup
import httpx
import os
import json
from typing import Dict, List, Optional, Any
from dotenv import load_dotenv
from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeoutError
import logging
import asyncio
from ratelimit import limits, sleep_and_retry
from cachetools import TTLCache
from fastapi.responses import Response
from urllib.parse import urlparse
import openai
import google.generativeai as genai
import base64

# Set up logging so we can see what's happening in the console
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables from .env file
load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
openai.api_key = os.getenv("OPENAI_API_KEY")

# Initialize FastAPI app
app = FastAPI(title="Website Cloner API", description="AI-powered website cloning system")

# Allow requests from the frontend (localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Set up a simple in-memory cache (good enough for this demo)
cache = TTLCache(maxsize=100, ttl=3600)  # Cache for 1 hour

# Rate limiting to avoid hammering the backend or getting blocked by sites
ONE_MINUTE = 60
MAX_REQUESTS_PER_MINUTE = 30

@sleep_and_retry
@limits(calls=MAX_REQUESTS_PER_MINUTE, period=ONE_MINUTE)
def rate_limit():
    # This function is just a decorator for rate limiting
    pass

# Request model for the /clone and /analyze endpoints
class CloneRequest(BaseModel):
    url: HttpUrl
    model: Optional[str] = "gpt-4o"
    include_images: Optional[bool] = True
    include_styles: Optional[bool] = True

# This class holds all the design context we extract from a website
class DesignContext(BaseModel):
    """Comprehensive design context extracted from a website"""
    title: str
    description: str
    content_structure: List[Dict[str, Any]]
    color_palette: List[str]
    typography: Dict[str, Any]
    layout_info: Dict[str, Any]
    images: List[Dict[str, str]]
    stylesheets: List[str]
    dom_structure: Dict[str, Any]
    css_contents: List[str]
    full_html: str
    screenshot: Optional[str]
    assets: List[Dict[str, Any]]
    fonts: List[str]
    media_queries: List[Dict[str, Any]]
    embedded_styles: List[str]
    inline_styles: List[Dict[str, str]]

# Main class for scraping websites and extracting design context
class WebScraper:
    """Enhanced web scraping class with comprehensive design context extraction"""
    
    @staticmethod
    async def download_css(stylesheet_urls, base_url):
        # Download all CSS files (handles relative URLs too)
        css_contents = []
        async with httpx.AsyncClient() as client:
            for url in stylesheet_urls:
                # If the URL is relative, prepend the base URL
                if url.startswith('/'):
                    url = base_url.rstrip('/') + url
                try:
                    # Try to fetch the CSS file
                    resp = await client.get(url, timeout=10)
                    if resp.status_code == 200:
                        css_contents.append(resp.text)
                except Exception as e:
                    # Log any errors but continue with other files
                    print(f"Failed to download CSS from {url}: {e}")
        return css_contents

    @staticmethod
    async def fetch_page_data(url: str, max_retries: int = 3) -> Dict[str, Any]:
        """Fetch complete page data with retry mechanism and rate limiting"""
        rate_limit()  # Make sure we don't go over our rate limit
        for attempt in range(max_retries):
            try:
                async with async_playwright() as p:
                    # Launch a headless browser
                    browser = await p.chromium.launch(headless=True)
                    context = await browser.new_context(
                        viewport={'width': 1920, 'height': 1080},
                        user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        java_script_enabled=True
                    )
                    page = await context.new_page()
                    try:
                        # Try to load the page and wait for network to be idle
                        await page.goto(str(url), wait_until='networkidle', timeout=30000)
                    except PlaywrightTimeoutError:
                        logger.warning(f"Timeout while loading {url}, continuing with partial content")
                    await page.wait_for_load_state('domcontentloaded')
                    
                    # Scroll to the bottom to trigger lazy loading
                    await page.evaluate("""
                        async () => {
                            await new Promise((resolve) => {
                                let totalHeight = 0;
                                const distance = 100;
                                const timer = setInterval(() => {
                                    const scrollHeight = document.body.scrollHeight;
                                    window.scrollBy(0, distance);
                                    totalHeight += distance;
                                    if(totalHeight >= scrollHeight){
                                        clearInterval(timer);
                                        resolve();
                                    }
                                }, 100);
                            });
                        }
                    """)
                    
                    # Get all network assets (images, fonts, etc.)
                    assets = await page.evaluate("""
                        () => {
                            const resources = performance.getEntriesByType('resource');
                            return resources.map(resource => ({
                                url: resource.name,
                                type: resource.initiatorType,
                                size: resource.transferSize,
                                duration: resource.duration
                            }));
                        }
                    """)
                    
                    # Get all font families used on the page
                    fonts = await page.evaluate("""
                        () => {
                            const fontFamilies = new Set();
                            document.querySelectorAll('*').forEach(el => {
                                const computed = window.getComputedStyle(el);
                                fontFamilies.add(computed.fontFamily);
                            });
                            return Array.from(fontFamilies);
                        }
                    """)
                    
                    # Get all media queries from stylesheets
                    media_queries = await page.evaluate("""
                        () => {
                            const queries = [];
                            for (let i = 0; i < document.styleSheets.length; i++) {
                                try {
                                    const sheet = document.styleSheets[i];
                                    if (sheet.cssRules) {
                                        for (let j = 0; j < sheet.cssRules.length; j++) {
                                            const rule = sheet.cssRules[j];
                                            if (rule instanceof CSSMediaRule) {
                                                queries.push({
                                                    condition: rule.conditionText,
                                                    rules: Array.from(rule.cssRules).map(r => r.cssText)
                                                });
                                            }
                                        }
                                    }
                                } catch (e) {
                                    console.warn('Error accessing stylesheet:', e);
                                }
                            }
                            return queries;
                        }
                    """)
                    
                    # Get all <style> tag contents
                    embedded_styles = await page.evaluate("""
                        () => {
                            const styles = [];
                            document.querySelectorAll('style').forEach(style => {
                                styles.push(style.textContent);
                            });
                            return styles;
                        }
                    """)
                    
                    # Get all inline styles from elements
                    inline_styles = await page.evaluate("""
                        () => {
                            const styles = [];
                            document.querySelectorAll('[style]').forEach(el => {
                                const className = el.className;
                                const classStr = typeof className === 'string' ? className : 
                                    (className.baseVal || '');  // Handle SVGAnimatedString
                                styles.push({
                                    selector: el.tagName.toLowerCase() + 
                                        (el.id ? '#' + el.id : '') + 
                                        (classStr ? '.' + classStr.split(' ').join('.') : ''),
                                    style: el.getAttribute('style')
                                });
                            });
                            return styles;
                        }
                    """)
                    
                    # Get the full HTML and a screenshot
                    html = await page.content()
                    screenshot_bytes = await page.screenshot(type='png', full_page=True)
                    screenshot_base64 = base64.b64encode(screenshot_bytes).decode('utf-8')
                    
                    # Get all stylesheet URLs (including @import)
                    stylesheets = await page.evaluate("""
                        () => {
                            const sheets = [];
                            for (let i = 0; i < document.styleSheets.length; i++) {
                                try {
                                    const sheet = document.styleSheets[i];
                                    if (sheet.href) {
                                        sheets.push(sheet.href);
                                    }
                                    if (sheet.cssRules) {
                                        for (let j = 0; j < sheet.cssRules.length; j++) {
                                            const rule = sheet.cssRules[j];
                                            if (rule instanceof CSSImportRule) {
                                                sheets.push(rule.href);
                                            }
                                        }
                                    }
                                } catch (e) {
                                    console.warn('Error accessing stylesheet:', e);
                                }
                            }
                            return sheets;
                        }
                    """)
                    
                    # Download the actual CSS contents
                    parsed_url = url.split("/")
                    base_url = parsed_url[0] + "//" + parsed_url[2] if len(parsed_url) > 2 else url
                    css_contents = await WebScraper.download_css(stylesheets, base_url)
                    
                    # Get computed styles for all elements (for color/typography extraction)
                    computed_styles = await page.evaluate("""
                        () => {
                            const styles = {};
                            document.querySelectorAll('*').forEach((el, index) => {
                                try {
                                    const computed = window.getComputedStyle(el);
                                    styles[el.tagName.toLowerCase() + '_' + index] = {
                                        tag: el.tagName.toLowerCase(),
                                        class: el.className,
                                        id: el.id,
                                        style: el.getAttribute('style'),
                                        computed: {
                                            fontFamily: computed.fontFamily,
                                            fontSize: computed.fontSize,
                                            color: computed.color,
                                            backgroundColor: computed.backgroundColor,
                                            margin: computed.margin,
                                            padding: computed.padding,
                                            display: computed.display,
                                            position: computed.position,
                                            zIndex: computed.zIndex,
                                            width: computed.width,
                                            height: computed.height,
                                            flexDirection: computed.flexDirection,
                                            justifyContent: computed.justifyContent,
                                            alignItems: computed.alignItems,
                                            gridTemplateColumns: computed.gridTemplateColumns,
                                            gridTemplateRows: computed.gridTemplateRows,
                                            gap: computed.gap
                                        }
                                    };
                                } catch (e) {}
                            });
                            return styles;
                        }
                    """)
                    
                    # Get meta tags (for SEO info)
                    meta_info = await page.evaluate("""
                        () => {
                            const meta = {};
                            document.querySelectorAll('meta').forEach(tag => {
                                const name = tag.getAttribute('name') || tag.getAttribute('property');
                                if (name) {
                                    meta[name] = tag.getAttribute('content');
                                }
                            });
                            return meta;
                        }
                    """)
                    
                    await browser.close()
                    return {
                        'html': html,
                        'screenshot': screenshot_base64,
                        'stylesheets': stylesheets,
                        'css_contents': css_contents,
                        'computed_styles': computed_styles,
                        'meta_info': meta_info,
                        'assets': assets,
                        'fonts': fonts,
                        'media_queries': media_queries,
                        'embedded_styles': embedded_styles,
                        'inline_styles': inline_styles
                    }
            except Exception as e:
                logger.error(f"Attempt {attempt + 1} failed: {str(e)}")
                if attempt == max_retries - 1:
                    raise HTTPException(status_code=500, detail=f"Failed to fetch page after {max_retries} attempts")
                await asyncio.sleep(2 ** attempt)  # Exponential backoff
        raise HTTPException(status_code=500, detail="Failed to fetch page data")
    
    @staticmethod
    def extract_design_context(html: str, page_data: Dict[str, Any]) -> DesignContext:
        """Extract comprehensive design context from scraped data"""
        soup = BeautifulSoup(html, 'html.parser')
        
        # Remove scripts and unwanted elements for cleaner parsing
        for tag in soup(['script', 'noscript', 'style']):
            tag.decompose()
        
        # Get the page title and meta description
        title = soup.title.string.strip() if soup.title else "Untitled"
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        description = meta_desc.get('content', '') if meta_desc else ''
        
        # Extract main content structure (headings, paragraphs, etc.)
        content_structure = []
        for tag in soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'button', 'nav', 'header', 'footer', 'section', 'article']):
            text = tag.get_text(strip=True)
            if text and len(text) > 2:
                content_structure.append({
                    'tag': tag.name,
                    'text': text[:200],  # Limit text length
                    'class': ' '.join(tag.get('class', [])),
                    'id': tag.get('id', ''),
                    'style': tag.get('style', '')
                })
        
        # Extract color palette from computed styles
        colors = set()
        for element_styles in page_data.get('computed_styles', {}).values():
            if element_styles.get('computed', {}).get('color'):
                colors.add(element_styles['computed']['color'])
            if element_styles.get('computed', {}).get('backgroundColor'):
                colors.add(element_styles['computed']['backgroundColor'])
        
        # Extract typography info from headings
        typography = {}
        for key, element_styles in page_data.get('computed_styles', {}).items():
            if 'h1' in key or 'h2' in key or 'h3' in key:
                typography[key] = {
                    'fontFamily': element_styles.get('computed', {}).get('fontFamily', ''),
                    'fontSize': element_styles.get('computed', {}).get('fontSize', '')
                }
        
        # Extract layout info (sections, headers, etc.)
        layout_sections = []
        for section in soup.find_all(['header', 'nav', 'main', 'section', 'aside', 'footer']):
            layout_sections.append({
                'tag': section.name,
                'class': ' '.join(section.get('class', [])),
                'children_count': len(section.find_all())
            })
        
        # Extract all images (up to 10)
        images = []
        for img in soup.find_all('img'):
            img_info = {
                'src': img.get('src', ''),
                'alt': img.get('alt', ''),
                'class': ' '.join(img.get('class', [])),
                'style': img.get('style', '')
            }
            if img_info['src']:
                images.append(img_info)
        
        # Build a simplified DOM structure (recursive, but limited depth)
        dom_structure = WebScraper._create_dom_structure(soup.body if soup.body else soup)
        
        return DesignContext(
            title=title,
            description=description,
            content_structure=content_structure[:20],  # Limit to first 20 elements
            color_palette=list(colors)[:10],  # Limit to 10 colors
            typography=typography,
            layout_info={'sections': layout_sections},
            images=images[:10],  # Limit to 10 images
            stylesheets=page_data.get('stylesheets', [])[:5],  # Limit to 5 stylesheets
            dom_structure=dom_structure,
            css_contents=page_data.get('css_contents', []),
            full_html=html,
            screenshot=page_data.get('screenshot', None),
            assets=page_data.get('assets', []),
            fonts=page_data.get('fonts', []),
            media_queries=page_data.get('media_queries', []),
            embedded_styles=page_data.get('embedded_styles', []),
            inline_styles=page_data.get('inline_styles', [])
        )
    
    @staticmethod
    def _create_dom_structure(element, max_depth=3, current_depth=0):
        """Create a simplified DOM structure representation"""
        if current_depth >= max_depth:
            return {'tag': 'truncated', 'class': '', 'id': '', 'children': []}
        
        if element.name is None:
            # If it's a text node, return its content
            text_content = element.string.strip() if element.string else ""
            if text_content:
                return {'tag': 'text', 'content': text_content[:100], 'class': '', 'id': '', 'children': []}
            return None
        
        structure = {
            'tag': element.name,
            'class': ' '.join(element.get('class', [])),
            'id': element.get('id', ''),
            'children': []
        }
        
        # Only include first few children to avoid huge structures
        children = list(element.children)[:5]
        for child in children:
            if hasattr(child, 'name'):
                child_structure = WebScraper._create_dom_structure(child, max_depth, current_depth + 1)
                if child_structure:
                    structure['children'].append(child_structure)
        
        return structure

class LLMCloner:
    """Advanced LLM cloning with multiple models and reasoning chains"""
    
    MODELS = {
        "gpt-4o": "gpt-4o",
        "gpt-4-turbo": "gpt-4-turbo",
        "gpt-3.5-turbo": "gpt-3.5-turbo",
        # Gemini models:
        "gemini-1.5-pro-latest": "models/gemini-1.5-pro-latest",
        "gemini-1.5-flash-latest": "models/gemini-1.5-flash-latest",
        "gemini-pro-vision": "models/gemini-pro-vision",
        "gemini-1.0-pro-vision-latest": "models/gemini-1.0-pro-vision-latest",
    }

    # Maximum character limits for different context types
    MAX_LIMITS = {
        "html": 10000,
        "css": 8000,
        "computed_styles": 8000,
        "content_structure": 5000,
        "typography": 3000,
        "layout_info": 3000,
        "images": 3000,
        "dom_structure": 5000
    }
    
    @staticmethod
    def truncate_context(context: Dict[str, Any]) -> Dict[str, Any]:
        """Truncate context fields to stay within token limits"""
        truncated = {}
        for key, value in context.items():
            if key in LLMCloner.MAX_LIMITS:
                if isinstance(value, str):
                    truncated[key] = value[:LLMCloner.MAX_LIMITS[key]] + ("\n...[truncated]..." if len(value) > LLMCloner.MAX_LIMITS[key] else "")
                elif isinstance(value, (list, dict)):
                    # Convert to string, truncate, then parse back
                    str_value = json.dumps(value)
                    truncated_str = str_value[:LLMCloner.MAX_LIMITS[key]] + ("\n...[truncated]..." if len(str_value) > LLMCloner.MAX_LIMITS[key] else "")
                    try:
                        truncated[key] = json.loads(truncated_str)
                    except json.JSONDecodeError:
                        # If JSON parsing fails, keep the truncated string
                        truncated[key] = truncated_str
            else:
                truncated[key] = value
        return truncated

    @staticmethod
    async def clone_with_reasoning_chain(design_context: DesignContext, model: str = "gpt-4o") -> str:
        """Use a multi-step reasoning chain approach for better cloning"""
        
        # Convert design context to dict and truncate
        context_dict = design_context.dict()
        truncated_context = LLMCloner.truncate_context(context_dict)
        
        # Step 1: Analyze the design
        analysis_prompt = f"""
        Analyze this website design context and provide a structured analysis:
        
        Title: {truncated_context['title']}
        Description: {truncated_context['description']}
        
        Content Structure: {json.dumps(truncated_context['content_structure'], indent=2)}
        Color Palette: {truncated_context['color_palette']}
        Typography: {json.dumps(truncated_context['typography'], indent=2)}
        
        Please analyze:
        1. The overall design aesthetic and style
        2. The content hierarchy and organization
        3. The color scheme and its emotional impact
        4. The typography choices and their purpose
        5. The layout structure and user flow
        6. Key interactive elements and their placement
        7. Accessibility features and improvements needed
        8. Mobile responsiveness considerations
        9. SEO elements and metadata
        10. Performance optimization opportunities
        """
        
        analysis = await LLMCloner._call_llm(analysis_prompt, model, "analysis")
        
        # Step 2: Generate content variations
        content_prompt = f"""
        Based on the analysis, generate unique content variations while maintaining the original structure:
        
        Analysis: {analysis}
        Original Content: {json.dumps(truncated_context['content_structure'], indent=2)}
        
        Requirements:
        1. Maintain the same content hierarchy and structure
        2. Create unique, non-plagiarized content
        3. Preserve key information and messaging
        4. Adapt tone and style to match the original
        5. Ensure content is engaging and professional
        6. Include proper semantic HTML elements
        7. Add appropriate ARIA labels
        8. Optimize for SEO
        9. Ensure mobile-friendly content
        10. Maintain brand voice consistency
        """
        
        content_variations = await LLMCloner._call_llm(content_prompt, model, "content")
        
        # Step 3: Generate style variations
        style_prompt = f"""
        Create modern style variations while maintaining the original aesthetic:
        
        Analysis: {analysis}
        Original Styles: {json.dumps({
            'color_palette': truncated_context['color_palette'],
            'typography': truncated_context['typography'],
            'layout_info': truncated_context['layout_info']
        }, indent=2)}
        
        Requirements:
        1. Maintain the original color scheme
        2. Preserve typography hierarchy
        3. Keep consistent spacing and layout
        4. Ensure responsive design
        5. Optimize for performance
        6. Enhance accessibility
        7. Add modern CSS features
        8. Include dark mode support
        9. Add smooth transitions
        10. Ensure cross-browser compatibility
        """
        
        style_variations = await LLMCloner._call_llm(style_prompt, model, "style")
        
        # Step 4: Generate final HTML
        final_prompt = f"""
You are an expert web developer and designer. Your task is to generate a complete, visually accurate HTML clone of the website at this exact URL, using only the design context below.

**Instructions:**
- Use ONLY the design context provided below, which was scraped from the given URL.
- Do NOT use any other website as reference.
- Output ONLY a single, complete HTML document.
- All CSS styles must be included, either as a <style> tag in the <head> or as inline style="" attributes.
- Do NOT include any explanations, comments, Markdown, or feature lists—just the HTML code.
- The result should look as close as possible to the original website, including layout, colors, fonts, and images (use placeholder images if needed).
- Use semantic HTML5 elements where possible.
- If the original site uses external fonts or assets, use Google Fonts or similar free alternatives.
- If you cannot access an image, use a placeholder image with similar dimensions.

**Design Context (scraped from the target URL):**

---

**Full Rendered HTML:**
{truncated_context['full_html']}

**CSS Contents:**
{chr(10).join(truncated_context['css_contents'])}

**Content Variations:**
{content_variations}

**Style Variations:**
{style_variations}

**DOM Structure:**
{json.dumps(truncated_context['dom_structure'], indent=2)}

**Images:**
{json.dumps(truncated_context['images'], indent=2)}

---

Generate the HTML now:
"""
        html_content = await LLMCloner._call_llm(final_prompt, model, "html")
        # Clean and validate the generated HTML
        cleaned_html = LLMCloner._clean_html_response(html_content)
        return cleaned_html
    
    @staticmethod
    async def _call_llm(prompt: str, model: str, task_type: str) -> str:
        """Enhanced LLM call with better error handling and response processing"""
        try:
            # Add task-specific system message
            system_messages = {
                "overview": "You are a web design expert providing a high-level summary of a website's design.",
                "analysis": "You are a web design expert analyzing website structure and aesthetics.",
                "content": "You are a content strategist creating unique variations of web content.",
                "style": "You are a UI/UX designer creating modern, accessible design variations.",
                "html": "You are a frontend developer creating semantic, responsive HTML structures."
            }
            
            system_message = system_messages.get(task_type, "You are an AI assistant helping with website cloning.")
            
            # Add task-specific instructions
            task_instructions = {
                "overview": "Provide a concise, high-level summary of the website's design and user experience.",
                "analysis": "Provide a detailed, structured analysis of the website design.",
                "content": "Generate unique content variations while maintaining the original structure.",
                "style": "Create style variations that maintain the original aesthetic.",
                "html": "Generate clean, semantic HTML with all necessary elements."
            }
            
            # Truncate the prompt if it's too long
            if len(prompt) > 30000:  # Conservative limit for total prompt size
                logger.warning("Prompt exceeds 30k characters, truncating...")
                prompt = prompt[:30000] + "\n...[truncated]..."
            
            full_prompt = f"{system_message}\n\n{task_instructions[task_type]}\n\n{prompt}"
            
            # Make API call with retry mechanism
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    if model.startswith("gemini"):
                        # Use Gemini model
                        gemini_model = genai.GenerativeModel(model)
                        # Configure the model with safety settings
                        generation_config = {
                            "temperature": 0.7,
                            "top_p": 0.8,
                            "top_k": 40,
                            "max_output_tokens": 2048,
                        }
                        # Create the chat session
                        chat = gemini_model.start_chat(history=[])
                        # Add system message as the first message
                        chat.send_message(system_message)
                        # Send the actual prompt
                        response = await chat.send_message_async(full_prompt)
                        return response.text
                    else:
                        # Use OpenAI model
                        response = await openai.ChatCompletion.acreate(
                            model=model,
                            messages=[
                                {"role": "system", "content": system_message},
                                {"role": "user", "content": full_prompt}
                            ],
                            temperature=0.7,
                            max_tokens=2000
                        )
                        return response.choices[0].message.content
                except Exception as e:
                    if attempt == max_retries - 1:
                        raise e
                    await asyncio.sleep(1)
            
        except Exception as e:
            logger.error(f"Error in LLM call: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to generate content: {str(e)}"
            )
    
    @staticmethod
    def _clean_html_response(html: str) -> str:
        """Clean and validate the generated HTML"""
        try:
            # Parse HTML
            soup = BeautifulSoup(html, 'html.parser')
            
            # Add missing meta tags
            if not soup.find('meta', attrs={'name': 'viewport'}):
                viewport = soup.new_tag('meta')
                viewport['name'] = 'viewport'
                viewport['content'] = 'width=device-width, initial-scale=1.0'
                soup.head.append(viewport)
            
            # Add missing charset
            if not soup.find('meta', attrs={'charset': True}):
                charset = soup.new_tag('meta')
                charset['charset'] = 'UTF-8'
                soup.head.append(charset)
            
            # Add missing title
            if not soup.find('title'):
                title = soup.new_tag('title')
                title.string = 'Cloned Website'
                soup.head.append(title)
            
            # Add missing favicon
            if not soup.find('link', attrs={'rel': 'icon'}):
                favicon = soup.new_tag('link')
                favicon['rel'] = 'icon'
                favicon['type'] = 'image/x-icon'
                favicon['href'] = '/favicon.ico'
                soup.head.append(favicon)
            
            # Add missing CSS reset
            if not soup.find('link', attrs={'rel': 'stylesheet', 'href': 'https://unpkg.com/modern-css-reset/dist/reset.min.css'}):
                reset = soup.new_tag('link')
                reset['rel'] = 'stylesheet'
                reset['href'] = 'https://unpkg.com/modern-css-reset/dist/reset.min.css'
                soup.head.append(reset)
            
            # Add missing loading states
            for img in soup.find_all('img'):
                if not img.get('loading'):
                    img['loading'] = 'lazy'
                if not img.get('alt'):
                    img['alt'] = 'Image'
            
            # Add missing ARIA labels
            for button in soup.find_all('button'):
                if not button.get('aria-label'):
                    button['aria-label'] = button.get_text().strip() or 'Button'
            
            # Add missing form labels
            for input_field in soup.find_all('input'):
                if not input_field.get('aria-label'):
                    input_field['aria-label'] = input_field.get('placeholder') or 'Input field'
            
            return str(soup)
            
        except Exception as e:
            logger.error(f"Error cleaning HTML: {str(e)}")
            return html

# API Endpoints

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": "Website Cloner API",
        "version": "2.0.0",
        "description": "AI-powered website cloning system with enhanced scraping and content variation",
        "endpoints": {
            "/clone": "Clone a website with AI-powered content variation",
            "/analyze": "Analyze a website's design and structure",
            "/models": "Get available AI models"
        }
    }

@app.get("/models")
async def get_available_models():
    """Get list of available AI models"""
    return {
        "models": list(LLMCloner.MODELS.keys()),
        "default": "gpt-4o",
        "recommended": ["gpt-4o", "gpt-4-turbo"]
    }

@app.post("/clone")
async def clone_website(request: CloneRequest):
    """Clone a website with AI-powered content variation"""
    try:
        # Check cache first
        cache_key = f"clone_{request.url}_{request.model}_{request.include_images}_{request.include_styles}"
        if cache_key in cache:
            logger.info(f"Returning cached result for {request.url}")
            return cache[cache_key]
        
        # Fetch and analyze the website
        logger.info(f"Fetching website data from {request.url}")
        page_data = await WebScraper.fetch_page_data(str(request.url))
        
        # Extract design context
        logger.info("Extracting design context")
        design_context = WebScraper.extract_design_context(page_data['html'], page_data)
        logger.info(f"Extracted design context: {design_context.dict()}")
        
        # Generate cloned version with AI
        logger.info(f"Generating cloned version using model: {request.model}")
        cloned_html = await LLMCloner.clone_with_reasoning_chain(design_context, request.model)
        
        # Prepare response
        response = {
            "status": "success",
            "original_url": str(request.url),
            "model_used": request.model,
            "html": cloned_html,
            "design_context": design_context.dict(),
            "metadata": {
                "title": design_context.title,
                "description": design_context.description,
                "content_elements": len(design_context.content_structure),
                "colors": len(design_context.color_palette),
                "images": len(design_context.images),
                "stylesheets": len(design_context.stylesheets)
            }
        }
        
        # Cache the result
        cache[cache_key] = response
        
        return response
        
    except Exception as e:
        logger.error(f"Error cloning website: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to clone website: {str(e)}"
        )

@app.post("/analyze")
async def analyze_website(request: CloneRequest):
    """Analyze a website's design and structure"""
    try:
        # Check cache first
        cache_key = f"analyze_{request.url}"
        if cache_key in cache:
            logger.info(f"Returning cached analysis for {request.url}")
            return cache[cache_key]
        
        # Fetch website data
        logger.info(f"Fetching website data from {request.url}")
        page_data = await WebScraper.fetch_page_data(str(request.url))
        
        # Extract design context
        logger.info("Extracting design context")
        design_context = WebScraper.extract_design_context(page_data['html'], page_data)
        logger.info(f"Extracted design context: {design_context.dict()}")
        
        # Convert to dict and truncate
        context_dict = design_context.dict()
        truncated_context = LLMCloner.truncate_context(context_dict)
        
        # Generate general overview
        overview_prompt = f"""
Provide a concise, high-level summary of the overall design and user experience of the website based on the provided context.
Do NOT repeat detailed points or feature lists; just give a general impression and summary in 2-4 sentences.

Context:
Title: {truncated_context['title']}
Description: {truncated_context['description']}
Color Palette: {truncated_context['color_palette']}
Typography: {json.dumps(truncated_context['typography'], indent=2)}
Layout Info: {json.dumps(truncated_context['layout_info'], indent=2)}
"""
        overview = await LLMCloner._call_llm(overview_prompt, request.model, "overview")

        # Generate analysis
        logger.info("Generating design analysis")
        analysis_prompt = f"""
        Analyze this website design context and provide a detailed analysis:
        
        Title: {truncated_context['title']}
        Description: {truncated_context['description']}
        
        Content Structure: {json.dumps(truncated_context['content_structure'], indent=2)}
        Color Palette: {truncated_context['color_palette']}
        Typography: {json.dumps(truncated_context['typography'], indent=2)}
        Layout Info: {json.dumps(truncated_context['layout_info'], indent=2)}
        
        Please provide a comprehensive analysis including:
        1. Overall design style and aesthetic
        2. Content organization and hierarchy
        3. Color scheme analysis
        4. Typography system
        5. Layout structure
        6. Interactive elements
        7. Accessibility considerations
        8. Mobile responsiveness
        9. SEO elements
        10. Performance considerations
        """
        analysis = await LLMCloner._call_llm(analysis_prompt, request.model, "analysis")

        # Prepare response
        response = {
            "status": "success",
            "url": str(request.url),
            "overview": overview,
            "analysis": analysis,
            "design_context": design_context.dict()
        }
        
        # Cache the result
        cache[cache_key] = response
        
        return response
        
    except Exception as e:
        logger.error(f"Error analyzing website: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze website: {str(e)}"
        )

@app.get("/proxy")
async def proxy_original_website(url: str):
    """Proxy endpoint to fetch and serve the HTML of a target URL, removing frame-blocking headers."""
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        raise HTTPException(status_code=400, detail="Invalid URL scheme.")
    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=15) as client:
            resp = await client.get(url)
            content_type = resp.headers.get("content-type", "text/html")
            # Remove frame-blocking headers if present
            headers = dict(resp.headers)
            headers.pop("x-frame-options", None)
            headers.pop("content-security-policy", None)
            return Response(content=resp.content, media_type=content_type)
    except Exception as e:
        logger.error(f"Proxy fetch failed: {e}")
        raise HTTPException(status_code=502, detail=f"Failed to fetch original website: {e}")

async def download_css(stylesheet_urls, base_url):
    css_contents = []
    async with httpx.AsyncClient() as client:
        for url in stylesheet_urls:
            # Handle relative URLs
            if url.startswith('/'):
                url = base_url.rstrip('/') + url
            try:
                resp = await client.get(url, timeout=10)
                if resp.status_code == 200:
                    css_contents.append(resp.text)
            except Exception as e:
                print(f"Failed to download CSS from {url}: {e}")
    return css_contents

if __name__ == "__main__":
    import uvicorn # type: ignore
    uvicorn.run(app, host="0.0.0.0", port=8000)
