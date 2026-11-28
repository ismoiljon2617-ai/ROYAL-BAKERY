# ROYAL BAKERY — project structure

## Frontend files
- `index.html` — page structure and SEO metadata
- `style.css` — brand styles and responsive layout
- `script.js` — navigation, product rendering, validation and interactions
- `data/products.js` — product catalogue (name, description, price, image)
- `assets/images/` — locally stored WebP images

## Edit a product
Open `data/products.js`. Edit a product's `name`, `description`, `price`, or `image`.
Keep each `id` unique. Add new image files to `assets/images/` and use a relative path.

## Future admin panel
A real admin panel should be added separately and connected to a backend API and database.
Authentication and permissions must be enforced on the server. A password check in browser
JavaScript alone is not secure. The product cards already read from a separate catalogue file,
so a future API can become the data source without rebuilding the card design.
