# TasteAI — AI-powered Culinary Recommendation App

TasteAI is an AI-powered culinary recommendation app that helps users discover food, restaurants, and cooking inspiration with just a few simple prompts. The app is built using a full-stack architecture (Next.js + Express + Prisma + PostgreSQL) with support for AI generation, image uploads, and user search history.

---

## 📸 UI Preview

<div align="center">
  <img src="AiGenerate.png" width="800">
</div>

---

## 🚀 Tech Stack

### **Frontend (ai-generate-fe)**

* **Next.js (App Router)**
* **React**
* **TypeScript**
* **TailwindCSS**

### **Backend (ai-generate-be)**

* **Node.js + Express.js**
* **TypeScript**
* **Prisma ORM**
* **PostgreSQL**
* **Cloudinary**
* **Gemini API**

---

## 📌 Fitur Utama

### ✅ **Generate Food Recommendations with AI**

Users can enter prompts such as:

* "Food recommendations based on location"
* "Food recommendations based on image"

The backend will send the prompt to the AI ​​model and save the results to the database as a history.

---

### ✅ **Search History**

Each generation is saved, and users can review previous AI suggestions.

---

## 📂 Folder Structure

### **Backend (`ai-generate-be/`)**

```
ai-generate-be/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── api
│   ├── controllers
|   │   └── aiGenerate.ts
|   │   └── auth.ts
│   ├── middlewares
|   │   └── auth.ts
│   ├── routes
|   │   └── aiGenerate.ts
|   │   └── auth.ts
│   ├── prisma
|   │   └── client.ts
│   ├── services
|   │   └── aiGenerate.ts
│   ├── types
|   │   └── index.d.ts
│   ├── utils
│   ├── server.ts
└── package.json
```

### **Frontend (`ai-generate-fe/`)**

```
ai-generate-fe/
├── app/
│   ├── generate/
│   │   └── page.tsx
│   ├── history/
│   │   └── page.tsx
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   └── layout.tsx
├── components/
│   ├── Navbar.tsx
│   └── RecommendationCard.tsx
├── utils/
│   ├── axios.ts
│   └── useAuth.ts
├── public/
├── styles/
└── package.json
```

---

## ⚙️ Instalasi & Setup

### **1. Clone Repo**

```
git clone https://github.com/toriqkun/TasteAI.git
cd TasteAI
```

### **2. Setup Backend**

```
cd ai-generate-be
npm install
```

Create `.env`:

```
DATABASE_URL=postgresql://user:pass@localhost:5432/tasteai
JWT_SECRET=your_secret_key
GOOGLE_MAPS_API_KEY=xxx
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
OPENAI_API_KEY=xxx
EMAIL_USER=xxx
EMAIL_PASS=xxx
```

Run Prisma:

```
npx prisma migrate dev
npm run dev
```

### **3. Setup Frontend**

```
cd ai-generate-fe
npm install
npm run dev
```

---

## 🧠 AI Generation Flow

1. User fills in the prompt and location
2. Frontend sends a request to the backend
3. Backend calls `generateAIService()` → OpenAI / Gemini
4. Results are saved to the database
5. Frontend displays the results + saves the history
---

## 🛠️ Development Notes

* Local uploads have been removed → replaced with **Cloudinary** in the middleware
* Flexible AI service: can use OpenAI / Gemini
* Frontend uses **client form**, image preview, and elegant error handling
