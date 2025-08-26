import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { TitleBar } from "@shopify/app-bridge-react";
import { BiypodCard } from "../components/ui/BiypodCard";
import { BiypodButton } from "../components/ui/BiypodButton";
import { authenticate } from "../shopify.server";
import { SupabaseSubscriptionService } from "../lib/billing/supabase-subscription.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const { shop: shopDomain } = session;

  // Get basic shop info
  const response = await admin.graphql(`
    query {
      shop {
        name
        email
        myshopifyDomain
        plan {
          displayName
        }
      }
    }
  `);

  const { data } = await response.json();
  const { shop } = data;

  // Check subscription status
  const subscription = await SupabaseSubscriptionService.getActiveSubscription(shopDomain);

  return {
    shop,
    subscription,
    hasActiveSubscription: !!subscription
  };
};

export default function Dashboard() {
  const { shop, subscription, hasActiveSubscription } = useLoaderData<typeof loader>();

  // Show onboarding flow if no active subscription
  if (!hasActiveSubscription) {
    return (
      <div className="space-y-6">
        <TitleBar title="Welcome to Biypod" />

        {/* Onboarding Welcome Section */}
        <BiypodCard className="bg-gradient-secondary text-white">
          <div className="p-8 text-center">
            <h1 className="text-3xl font-bold mb-4">
              Welcome to Biypod, {shop.name}! 🎉
            </h1>
            <p className="text-blue-100 mb-6 text-lg">
              Transform your products with our powerful 3D customization platform
            </p>
            <p className="text-blue-200 mb-8">
              To get started, please select a plan that fits your business needs.
            </p>
            <Link to="/billing/plans">
              <BiypodButton variant="outline" className="border-white text-white hover:bg-white hover:text-primary text-lg px-8 py-3">
                Choose Your Plan
              </BiypodButton>
            </Link>
          </div>
        </BiypodCard>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BiypodCard>
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                🎨
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Custom Design Tools</h3>
              <p className="text-gray-600">Create unique products with our intuitive design interface</p>
            </div>
          </BiypodCard>

          <BiypodCard>
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                🛍️
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Shopify Integration</h3>
              <p className="text-gray-600">Seamlessly sync your designs with your Shopify store</p>
            </div>
          </BiypodCard>

          <BiypodCard>
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                👁️
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Preview</h3>
              <p className="text-gray-600">See your designs come to life with instant previews</p>
            </div>
          </BiypodCard>
        </div>
      </div>
    );
  }

  // Show regular dashboard for users with active subscriptions
  return (
    <div className="space-y-6">
      <TitleBar title="Dashboard" />

      {/* Welcome Section */}
      <BiypodCard className="bg-gradient-secondary text-white">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back, {shop.name}!
          </h1>
          <p className="text-blue-100 mb-4">
            Your {subscription?.planType} plan is active. Ready to create amazing products?
          </p>
          <BiypodButton variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
            Create Product
          </BiypodButton>
        </div>
      </BiypodCard>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BiypodCard>
          <div className="p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">0</div>
            <div className="text-gray-600">Custom Products</div>
          </div>
        </BiypodCard>

        <BiypodCard>
          <div className="p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">0</div>
            <div className="text-gray-600">Active Designs</div>
          </div>
        </BiypodCard>

        <BiypodCard>
          <div className="p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">0</div>
            <div className="text-gray-600">Orders This Month</div>
          </div>
        </BiypodCard>
      </div>

      {/* Quick Actions */}
      <BiypodCard>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <BiypodButton variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white text-sm font-bold">
                +
              </div>
              <span>Create Product</span>
            </BiypodButton>

            <BiypodButton variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white text-sm font-bold">
                🎨
              </div>
              <span>Design Studio</span>
            </BiypodButton>

            <BiypodButton variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white text-sm font-bold">
                📊
              </div>
              <span>Analytics</span>
            </BiypodButton>

            <BiypodButton variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white text-sm font-bold">
                ⚙️
              </div>
              <span>Settings</span>
            </BiypodButton>
          </div>
        </div>
      </BiypodCard>

      {/* Shop Info */}
      <BiypodCard>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Shop Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Shop Name:</span>
              <span className="ml-2 text-gray-900">{shop.name}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Domain:</span>
              <span className="ml-2 text-gray-900">{shop.myshopifyDomain}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Email:</span>
              <span className="ml-2 text-gray-900">{shop.email}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Plan:</span>
              <span className="ml-2 text-gray-900">{shop.plan.displayName}</span>
            </div>
          </div>
        </div>
      </BiypodCard>
    </div>
  );
}
