# Warista Connect

Build a full e-commerce website for "Warista Electronics," a business in Fargo, North Dakota that sells new and used Samsung and iPhone devices. The site needs a public storefront and a secure, full-control admin dashboard, using Supabase for the database, authentication, and image storage.

## BRANDING & DESIGN
- Site name: Warista Electronics
- Clean, modern, trustworthy e-commerce look (think a premium small mobile-phone reseller shop)
- Color scheme: deep blue and white as primary, with an accent color (e.g. orange or teal) for buttons and highlights
- Fully responsive (mobile-first, since many buyers will browse on phones)
- Sticky header with logo/site name, navigation, and a search bar
- Footer with business name, location (Fargo, ND), contact email, and payment methods accepted

## SEED DATA / DEMO LISTINGS
- Populate the shop with 8-10 realistic demo phone listings (mix of iPhones and Samsung, new and used) so the site looks fully populated and attractive out of the box
- Use high-quality, attractive stock/placeholder product photography for each phone (clean product shots on a neutral/white background — the kind of imagery you'd see on a real phone-resale site)
- Every field on these seed listings — price, description, condition, storage, color, images — must be fully editable by the admin afterward, so the owner can replace placeholder content with his real inventory and real photos with zero friction

## PUBLIC PAGES

### 1. Home Page
- Hero section introducing Warista Electronics ("New & Used Samsung and iPhones — Fargo, ND")
- Featured/newest listings grid (pull latest 6-8 phones added), showing each phone's attractive product image, name, and price
- Category shortcuts: "iPhones" and "Samsung"
- Brief "How Buying Works" section explaining the order + payment process (see Checkout Flow below)

### 2. Shop / Browse Page
- Grid of all active phone listings (large, high-quality image, name, price, condition badge)
- Filters: Brand (Samsung / iPhone), Condition (New / Used), Price range
- Sort: Price (low-high, high-low), Newest first
- Search bar (search by model name/keyword)
- Pagination or infinite scroll

### 3. Product Detail Page
- Image gallery (support multiple images per phone, swipeable/clickable thumbnails, zoom on hover if possible)
- Product title (e.g. "iPhone 13 Pro Max - 256GB")
- Price (clearly editable from admin, never hardcoded)
- Condition badge (New / Used - Like New / Used - Good / Used - Fair)
- Full description (storage, color, battery health if used, included accessories, any defects/notes) — pulled live from the database so admin edits reflect instantly
- Stock status (In Stock / Sold)
- "Request to Buy" button that opens the order form (see below)
- Seller info: Warista Electronics, Fargo, ND

### 4. Order / Checkout Flow
Since payment is handled manually via PayPal, CashApp, and Zelle:
- Buyer clicks "Request to Buy" on a product
- A form collects: Buyer name, email, phone number, shipping address, preferred payment method (dropdown: PayPal / CashApp / Zelle), and any notes
- On submit, create an "order" record in the database with status "Pending Payment" linked to that product, and mark the product as "Reserved" so it doesn't show as available to others
- Show the buyer a confirmation screen with:
  - Order summary
  - Clear payment instructions for their chosen method (display Warista Electronics' PayPal.me link / CashApp $cashtag / Zelle email — pulled from admin settings, editable, never hardcoded)
  - Instruction to include the Order ID as payment reference/note
  - A note that the item will ship once payment is confirmed
- Also display/store the order clearly in the admin dashboard for review, and if feasible send a notification to alimandera@gmail.com via a Supabase edge function

### 5. Contact Page
- Simple contact form (name, email, message) that stores submissions in the database and is visible in admin
- Display business info: Warista Electronics, Fargo, North Dakota, alimandera@gmail.com
- Note accepted payment methods: PayPal, CashApp, Zelle

## ADMIN DASHBOARD — FULL CONTROL (protected route, requires login via Supabase Auth)
This is the most important part: once I hand the login credentials to the business owner, he must be able to run the entire website himself with no coding help. Build a complete, intuitive admin dashboard with:

### Admin: Manage Listings (full CRUD)
- Table/grid view of all phone listings with quick status indicators (Active / Reserved / Sold) and thumbnail images
- "Add New Phone" form with fields:
  - Brand (Samsung / iPhone - dropdown)
  - Model name
  - Storage capacity
  - Color
  - Condition (New / Used - Like New / Used - Good / Used - Fair)
  - Price (fully editable at any time)
  - Description (fully editable rich text or multi-line, at any time)
  - Battery health % (optional, relevant for used phones)
  - Multiple image upload (drag-and-drop, store in Supabase Storage, allow reordering, setting a main image, and deleting/replacing any image at any time)
  - Stock status toggle
- Edit any field on any existing listing at any time (price and description must be trivially easy to update — no re-uploading or rebuilding required)
- Delete listings
- Duplicate a listing (handy for similar phones) — nice to have

### Admin: Manage Orders
- List of all order requests with buyer info, product, chosen payment method, status
- Ability to update order status: Pending Payment → Paid → Shipped → Completed (or Cancelled)
- When marked "Paid" or "Completed," auto-update the linked product's stock status to Sold; when "Cancelled," auto-revert it to Active

### Admin: Manage Contact Messages
- View all messages submitted through the Contact page

### Admin: Site Settings (full control, no code required)
- Editable PayPal.me link, CashApp $cashtag, and Zelle email/phone — these populate the payment instructions shown to buyers automatically
- Editable business info shown in the footer/contact page (in case address, email, or hours change)
- Ability to change the admin password from within the dashboard

### Admin: Dashboard Overview
- Simple landing page for admin showing: total active listings, pending orders count, total messages — a quick at-a-glance summary when he logs in

## DATABASE STRUCTURE (Supabase)
- `products` table: id, brand, model, storage, color, condition, price, description, battery_health, images (array/related table), stock_status, created_at
- `orders` table: id, product_id (FK), buyer_name, buyer_email, buyer_phone, shipping_address, payment_method, notes, status, created_at
- `settings` table: paypal_link, cashapp_tag, zelle_info, business_address, business_email
- `contact_messages` table: id, name, email, message, created_at

## TECHNICAL REQUIREMENTS
- Use Supabase for auth, database, and image storage
- Admin routes must be fully protected and inaccessible without login
- Every piece of editable content (price, description, images, settings) must update live on the public site the instant it's saved in admin — no static/hardcoded data anywhere
- Form validation on all inputs (required fields, valid email format, etc.)
- Loading states and error handling on all data fetches
- Toast/notification confirmations for successful actions (listing added, price updated, order status changed, etc.)
- Mobile responsive across all pages and the admin dashboard itself, since the owner may manage listings from his phone

Please build this step by step, starting with the database schema and admin authentication, then the admin dashboard with full listing/order/settings management, then the public storefront populated with the attractive seed listings, then the order/checkout flow.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://warista-shop-hub.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e25eddc4-298d-4e4c-886f-abc440ec4342).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
