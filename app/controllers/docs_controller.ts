import fs from 'node:fs'

export default class DocsController {
  async docs() {
    return `
      <!doctype html>
      <html lang="en">
        <head>
          <title>API Reference</title>
          <meta charset="utf-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1" />
        </head>
        <body>
          <script
            id="api-reference"
            data-url="/api/docs/swagger"
            data-proxy-url="https://proxy.scalar.com"></script>
          <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
        </body>
      </html>
    `
  }

  async swagger() {
    return fs.readFileSync('swagger.yml').toString()
  }
}
