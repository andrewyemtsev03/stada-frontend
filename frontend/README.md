# STADA public website

Static, country-aware public website for STADA Kazakhstan, Georgia, Kyrgyzstan,
Armenia, Azerbaijan, Moldova, and Uzbekistan.

## Structure

- `index.html`, `culture.html`, `history.html`, and `worldwide.html` are the main
  pages.
- `products/` contains the product catalogue and product detail page.
- `css/`, `js/`, and `assets/` contain the site styles, behavior, and media.
- `vercel.json` configures the existing Vercel deployment.
- `staticwebapp.config.json` configures the planned Azure Static Web Apps
  deployment.

The application lives in the repository's `frontend` folder and has no build
step.

## Local development

Serve the repository with any static HTTP server. Opening the HTML files directly
with `file://` is not supported because the site loads JavaScript modules and API
content.

The site checks `https://api.stada.kz/health/db` and uses the Azure backend when
both the service and its PostgreSQL connection are healthy. It falls back to the
current Render backend when that check fails. The result is cached in session
storage for two minutes to avoid delaying every page navigation.

The backend can be overridden before the site scripts load:

```html
<script>
  window.STADA_BACKEND_BASE_URL = "https://api.example.com";
</script>
```

## Deployment

Deploy the `frontend` folder as a static website. Do not configure a separate
output or build directory. The primary branch is `main`.
