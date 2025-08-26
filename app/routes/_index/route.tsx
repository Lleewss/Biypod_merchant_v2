import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";

import { login } from "../../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export default function App() {
  const { showForm } = useLoaderData<typeof loader>();

  return (
    <div className="flex items-center justify-center h-screen w-full text-center p-4">
      <div className="grid gap-8">
        <h1 className="text-4xl font-bold text-gray-900 p-0 m-0">Welcome to Biypod</h1>
        <p className="text-xl text-gray-600 pb-8 p-0 m-0">
          Create custom products with our powerful design tools.
        </p>
        {showForm && (
          <Form className="flex items-center justify-start mx-auto gap-4" method="post" action="/auth/login">
            <label className="grid gap-1 max-w-80 text-left text-base">
              <span>Shop domain</span>
              <input className="p-2 border rounded" type="text" name="shop" />
              <span className="text-sm text-gray-500">e.g: my-shop-domain.myshopify.com</span>
            </label>
            <button className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700" type="submit">
              Log in
            </button>
          </Form>
        )}
        <ul className="list-none p-0 pt-12 m-0 flex gap-8 max-md:block">
          <li className="max-w-80 text-left max-md:pb-4">
            <strong>Custom Design Tools</strong>. Create unique products with our intuitive design interface.
          </li>
          <li className="max-w-80 text-left max-md:pb-4">
            <strong>Shopify Integration</strong>. Seamlessly sync your designs with your Shopify store.
          </li>
          <li className="max-w-80 text-left max-md:pb-4">
            <strong>Real-time Preview</strong>. See your designs come to life with instant previews.
          </li>
        </ul>
      </div>
    </div>
  );
}
