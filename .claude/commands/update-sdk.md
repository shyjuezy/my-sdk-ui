---
allowed-tools: Bash(*)
description: Rebuild VECU IDV SDK and copy files to public/lib for local testing
---

## Context
Rebuilds the VECU IDV SDK from source and copies the built files to the my-sdk-ui project's public/lib directory for local testing.

This command automates the process of:
1. Building the SDK from the sibling vecu-idv-web-sdk project
2. Copying all built files (JS, maps, TypeScript definitions, chunks) to my-sdk-ui/public/lib/
3. Verifying the integration works

## Your task
Please execute the following steps in order:

1. **Navigate to SDK directory and build the project:**
   ```bash
   cd /Users/shyju.viswambaran/frontend/vecu-idv-web-sdk && npm run build
   ```

2. **Copy all built files to my-sdk-ui/public/lib/:**
   ```bash
   cp /Users/shyju.viswambaran/frontend/vecu-idv-web-sdk/dist/index.* /Users/shyju.viswambaran/frontend/my-sdk-ui/public/lib/
   cp -r /Users/shyju.viswambaran/frontend/vecu-idv-web-sdk/dist/chunks /Users/shyju.viswambaran/frontend/my-sdk-ui/public/lib/
   ```

3. **Verify the files were copied successfully:**
   ```bash
   ls -la /Users/shyju.viswambaran/frontend/my-sdk-ui/public/lib/
   ```

4. **Test build my-sdk-ui to ensure integration works:**
   ```bash
   cd /Users/shyju.viswambaran/frontend/my-sdk-ui && npm run build
   ```

5. **Provide summary of what was updated:**
   - List the files that were updated with their timestamps
   - Confirm the build was successful
   - Note any issues that occurred during the process

This ensures the my-sdk-ui project always has the latest SDK changes for local testing and development.