# Video Consult: Real-Time E-Commerce Video Chat

A headless e-commerce demo that lets customers click **"Talk to a Product Expert"** on any product page and immediately join a secure 1:1 video consultation powered by [Stream Video SDK](https://getstream.io/video/).

## 🚀 Features

* **Static product pages** sourced from Contentful
* **One-click video call** with a product expert
* **Real-time 1:1 WebRTC video** via Stream’s React SDK
* **Serverless room & token** generation using Stream’s Node SDK
* **Clean UI** with built-in components (`SpeakerLayout`, `CallControls`)
* **Easy deployment** on Vercel/Netlify (Jamstack-ready)

## 🛠 Tech Stack

* Next.js 13 (App Router)
* Contentful Headless CMS
* [Stream Video SDK (React)](https://getstream.io/video/docs/react/basics/quickstart/) & [Stream Node SDK](https://www.npmjs.com/package/@stream-io/node-sdk)
* Tailwind CSS
* TypeScript

## 📥 Getting Started

### Prerequisites

* Node.js v14+
* npm or yarn
* A [Contentful](https://www.contentful.com/) account (Space ID + Delivery Token)
* A [Stream](https://getstream.io/) account (API Key + Secret)

### Environment Variables

Create a file named `.env.local` in the project root and fill in your keys:

```env
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_ACCESS_TOKEN=your_content_delivery_token
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret
```

> 🔒 **Important**: Never expose `STREAM_API_SECRET` to the client.

### Installation

```bash
npm install
# or
yarn install
```

### Run Locally

```bash
npm run dev
```

Open your browser to `http://localhost:3000/product/<your-slug>` to view a product page.

### Build for Production

```bash
npm run build
npm start
```

## 📂 Project Structure

```
├── src/
│   ├── app/
│   │   ├── product/[slug]/page.tsx      # Product detail + join call
│   │   └── call/[slug]/page.tsx         # In-call UI for customer & expert
│   ├── components/
│   │   └── VideoSession.tsx             # Self-contained Stream video session
│   ├── lib/
│   │   └── contentful.ts                # Contentful client setup
│   └── pages/
│       └── api/
│           └── create-room.ts           # Serverless room & token endpoint
├── types/
│   └── product.ts                       # Product type definition
├── .env.local
├── tailwind.config.js
├── next.config.js
└── README.md                            # <-- you are here
```

## 💻 Usage

1. **View a product** at `/product/<slug>` (e.g. `/product/blue-widget`).
2. **Click** **"Talk to a Product Expert"** to fetch a room token and mount the in-call UI.
3. **Expert** joins the same call by visiting `/call/<slug>?expert=true` (or use the same route with a different user ID).
4. **Hang up** with the built-in control to end the session.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to fork the repo and submit a PR.

## 📜 License

This project is open-sourced under the **MIT License**.
