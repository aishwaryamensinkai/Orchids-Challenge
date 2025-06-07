# Website Cloner API

This is the backend for the Website Cloner API, which allows you to clone and analyze websites using AI. This README provides detailed instructions for setting up and running the backend.

## Overview

The Website Cloner API is designed to help users clone and analyze websites by extracting design context and using AI to generate similar content. It leverages advanced web scraping techniques and AI models to provide a comprehensive understanding of a website's design and structure.

## Features

- **Advanced Web Scraping**: Extracts detailed design context, including typography, colors, layout, and more.
- **AI-Powered Cloning**: Uses AI models to generate similar content based on the extracted design context.
- **Multiple AI Models**: Supports various AI models for content generation and analysis.
- **Caching and Rate Limiting**: Implements caching and rate limiting to optimize performance and prevent overuse.
- **Comprehensive Error Handling**: Provides detailed error messages and logging for troubleshooting.

## Prerequisites

- **Python 3.8 or higher**: Ensure you have Python installed. You can check your version by running `python --version`.
- **pip**: The Python package manager. It usually comes with Python. You can check if it's installed by running `pip --version`.
- **Virtual Environment**: It's recommended to use a virtual environment to manage dependencies. You can create one using `venv`.

## Installation

1. **Create a Virtual Environment:**

   ```bash
   python -m venv .venv
   ```

2. **Activate the Virtual Environment:**

   - On Windows:
     ```bash
     .venv\\Scripts\\activate
     ```
   - On macOS/Linux:
     ```bash
     source .venv/bin/activate
     ```

3. **Install Dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

4. **Install Playwright Browsers:**

   ```bash
   playwright install
   ```

5. **Using `uv` for Dependency Management:**

   If you prefer using `uv` for managing dependencies, you can install it and use it as follows:

   ```bash
   pip install uv
   uv pip install -r requirements.txt
   ```

## Environment Setup

1. **Create a `.env` File:**

   In the `backend` directory, create a file named `.env` and add the following variables:

   ```
   OPENAI_API_KEY=your_openai_api_key
   GOOGLE_API_KEY=your_google_api_key
   ```

   Replace `your_openai_api_key` and `your_google_api_key` with your actual API keys.

## Running the Server

1. **Start the FastAPI Server:**

   ```bash
   uvicorn main:app --reload
   ```

   This will start the server at `http://localhost:8000`.

2. **Access the API Documentation:**

   Open your browser and go to `http://localhost:8000/docs` to see the interactive API documentation.

## API Endpoints

- **`/clone`**: Clone a website with AI-powered content variation.

  - **Method**: POST
  - **Body**:
    ```json
    {
      "url": "https://example.com",
      "model": "gpt-4o",
      "include_images": true,
      "include_styles": true
    }
    ```

- **`/analyze`**: Analyze a website's design and structure.

  - **Method**: POST
  - **Body**:
    ```json
    {
      "url": "https://example.com",
      "model": "gpt-4o"
    }
    ```

- **`/models`**: Get available AI models.
  - **Method**: GET

## Testing the API

### Using Postman

1. **Open Postman** and create a new request.
2. **Set the request type** to POST or GET, depending on the endpoint you want to test.
3. **Enter the URL** for the endpoint (e.g., `http://localhost:8000/clone`).
4. **For POST requests**, go to the "Body" tab, select "raw," and choose "JSON" from the dropdown. Enter the JSON body as shown in the API Endpoints section.
5. **Click "Send"** to execute the request and view the response.

### Using curl

1. **Open your terminal** and use the following command to test the `/clone` endpoint:

   ```bash
   curl -X POST http://localhost:8000/clone -H "Content-Type: application/json" -d '{"url": "https://example.com", "model": "gpt-4o", "include_images": true, "include_styles": true}'
   ```

2. **For the `/analyze` endpoint**, use:

   ```bash
   curl -X POST http://localhost:8000/analyze -H "Content-Type: application/json" -d '{"url": "https://example.com", "model": "gpt-4o"}'
   ```

3. **For the `/models` endpoint**, use:

   ```bash
   curl -X GET http://localhost:8000/models
   ```

## Additional Information

- **Technologies Used**:

  - **FastAPI**: A modern, fast web framework for building APIs with Python.
  - **Playwright**: A library for automating browsers, used for web scraping.
  - **OpenAI's GPT Models**: Used for content generation.
  - **BeautifulSoup4**: Used for HTML parsing.
  - **Cachetools**: Used for response caching.
  - **Ratelimit**: Used for request rate limiting.

- **Design Context**: The backend extracts comprehensive design context from websites, including typography, colors, layout, and more.

## Troubleshooting

- **Dependency Issues**: If you encounter issues with dependencies, ensure your virtual environment is activated and try reinstalling the packages.
- **API Key Issues**: Make sure your API keys are correctly set in the `.env` file.
- **Server Errors**: Check the logs for any error messages. If the server fails to start, ensure all dependencies are installed and the environment is set up correctly.

## Development

- **Code Structure**: The main logic is in `main.py`, which includes classes for web scraping and AI-powered cloning.
- **Testing**: Ensure to test the API endpoints using tools like Postman or curl.

## Contributing

We welcome contributions! If you want to contribute to this project, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them with a clear message.
4. Push your branch to your fork and submit a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.
