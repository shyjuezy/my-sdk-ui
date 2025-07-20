import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable source maps for debugging
  productionBrowserSourceMaps: true,
  
  // Webpack configuration for better debugging
  webpack: (config, { dev }) => {
    // Enable source maps in development
    if (dev) {
      config.devtool = 'eval-source-map';
    }
    
    // Configure source maps for the SDK
    config.module.rules.push({
      test: /\.js$/,
      use: ["source-map-loader"],
      enforce: "pre",
      exclude: /node_modules/
    });

    return config;
  },
};

export default nextConfig;
