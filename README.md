<h1 align="center">🛒 My React + Django Ecommerce Platform</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=white&style=flat-square" />
  <img src="https://img.shields.io/badge/Backend-Django-092E20?logo=django&logoColor=white&style=flat-square" />
  <img src="https://img.shields.io/badge/API-DRF-red?style=flat-square" />
  <img src="https://img.shields.io/badge/Styled_with-Tailwind_CSS-38B2AC?logo=tailwindcss&logoColor=white&style=flat-square" />
</p>

---

## 🖼️ Project Preview

| Home Page | Product Page | Checkout Page |
|-----------|--------------|---------------|
| ![](screenshots/home.png) | ![](screenshots/product.png) | ![](screenshots/checkout.png) |

---

## 🚀 Key Features

- ✅ **User Roles** (Customer / Vendor)
- 🔐 **JWT Authentication**
- 🛍️ **Product Listings** with filters & search
- 🛒 **Shopping Cart** and Wishlist
- 💳 **Payment Gateway** (SSLCommerz / PayPal)
- 📦 **Order Management**
- 📱 **Mobile Responsive UI**
- 🔊 **Sound, Confetti & Toasts for UX**

---

## 🧰 Tech Stack

| Category   | Technology |
|------------|------------|
| Frontend   | React, TailwindCSS, Axios |
| Backend    | Django, Django REST Framework |
| Database   | SQLite (dev), PostgreSQL (prod ready) |
| Auth       | JWT (SimpleJWT) |
| Dev Tools  | Vite, ESLint, Prettier |

---

## 🏗️ Project Structure

my-react-django-project/
├── backend/
│ ├── ecommerce/ # Django app
│ └── media/ # Uploaded product/media files
│
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ ├── App.jsx
│ │ └── main.jsx
│ └── public/
│
└── README.md

---

## ⚙️ Local Setup

### 🔧 Backend Setup

```bash
cd backend
python -m venv env
source env/bin/activate  # Windows: env\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

---

### 🔧 Frontend Setup

cd frontend
npm install
npm run dev

---

👤 Author
Swajan Talukder (Dipto)
🔗 GitHub: @swajan21
📧 Email: swajantalukderdipto@gmail.com
