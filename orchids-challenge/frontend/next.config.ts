import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "images.stripeassets.com",
      "b.stripecdn.com",
      // add any other domains you need
    ],
  },
};

export default nextConfig;
