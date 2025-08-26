import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs, HeadersFunction } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { BiypodCard } from "../../components/ui/BiypodCard";
import { BiypodButton } from "../../components/ui/BiypodButton";
import { BiypodLogo } from "../../components/ui/BiypodLogo";

import { login } from "../../shopify.server";

import { loginErrorMessage } from "./error.server";

export const headers: HeadersFunction = () => ({
  "X-Frame-Options": "ALLOWALL",
  "Content-Security-Policy": "frame-ancestors 'self' https://*.shopify.com https://*.myshopify.com https://admin.shopify.com",
});

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const errors = loginErrorMessage(await login(request));

  return { errors };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const errors = loginErrorMessage(await login(request));

  return {
    errors,
  };
};

export default function Auth() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [shop, setShop] = useState("");
  const { errors } = actionData || loaderData;

  return (
    <div className="min-h-screen bg-gradient-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <BiypodLogo variant="primary" color="white" className="h-12 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Welcome to Biypod</h1>
          <p className="text-blue-100 mt-2">Connect your Shopify store to get started</p>
        </div>

        <BiypodCard className="bg-white">
          <Form method="post">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Log in
                </h2>
              </div>

              <div>
                <label htmlFor="shop" className="block text-sm font-medium text-gray-700 mb-2">
                  Shop domain
                </label>
                <input
                  type="text"
                  id="shop"
                  name="shop"
                  value={shop}
                  onChange={(e) => setShop(e.target.value)}
                  autoComplete="on"
                  placeholder="example.myshopify.com"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.shop ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.shop && (
                  <p className="mt-1 text-sm text-red-600">{errors.shop}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">example.myshopify.com</p>
              </div>

              <BiypodButton type="submit" className="w-full">
                Log in
              </BiypodButton>
            </div>
          </Form>
        </BiypodCard>
      </div>
    </div>
  );
}
