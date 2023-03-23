import type { MetaFunction, LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import tailwindStyles from "~/styles/tailwind.css";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  viewport: "width=device-width,initial-scale=1",

  title: "GrowthX 🚀",
});

export const links: LinksFunction = () => [
  // meta
  {
    rel: "icon",
    type: "image/svg",
    href: "/logo.svg",
  },

  // font
  {
    rel: "preconnect",
    href: "https://fonts.googleapis.com",
  },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Work+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap",
  },

  // styles
  { rel: "stylesheet", href: tailwindStyles },
];

export default function App() {
  return (
    <html lang="en" className="scroll-smooth accent-blue-500">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="antialiased w-full min-h-screen bg-stone-50 text-stone-900 selection:bg-stone-900 selection:text-stone-50">
        <Outlet />

        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
