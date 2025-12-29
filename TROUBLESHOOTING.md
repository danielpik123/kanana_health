# Troubleshooting PDF Upload Error

## Error: "Unexpected token '<', "<!DOCTYPE "... is not valid JSON"

This error means the API route is returning HTML (an error page) instead of JSON. This typically happens when:

### Common Causes:

1. **Canvas Native Dependencies Missing**
   - The `canvas` package requires native system libraries
   - On macOS, you may need to install: `brew install pkg-config cairo pango libpng jpeg giflib librsvg`
   - Then rebuild: `npm rebuild canvas`

2. **Server-Side Import Error**
   - Check your terminal/console where `npm run dev` is running
   - Look for any import or module errors

3. **Next.js Configuration**
   - Make sure `next.config.ts` is properly configured
   - The route file should be at `app/api/upload-test/route.ts`

### Quick Fixes:

1. **Check Server Logs**
   ```bash
   # Look at your terminal where npm run dev is running
   # You should see the actual error there
   ```

2. **Rebuild Canvas (macOS)**
   ```bash
   brew install pkg-config cairo pango libpng jpeg giflib librsvg
   npm rebuild canvas
   ```

3. **Alternative: Use a Different PDF Processing Approach**
   - If canvas continues to cause issues, we can switch to a different PDF-to-image conversion method
   - Options: Use a cloud service, or process PDFs differently

### Check the Actual Error:

1. Open your browser's Developer Console (F12)
2. Go to the Network tab
3. Try uploading a PDF
4. Click on the `/api/upload-test` request
5. Check the Response tab - you'll see the actual HTML error page
6. Check the Preview tab - it might show the error message

### Next Steps:

If you see a specific error in the server logs or browser console, share it and I can help fix it!

