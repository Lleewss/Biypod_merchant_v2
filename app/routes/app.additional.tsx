import { TitleBar } from "@shopify/app-bridge-react";
import { BiypodCard } from "../components/ui/BiypodCard";

export default function AdditionalPage() {
  return (
    <div className="space-y-6">
      <TitleBar title="Additional page" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BiypodCard>
            <div className="space-y-4">
              <p className="text-gray-700">
                The app template comes with an additional page which
                demonstrates how to create multiple pages within app navigation
                using{" "}
                <a
                  href="https://shopify.dev/docs/apps/tools/app-bridge"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-dark underline"
                >
                  App Bridge
                </a>
                .
              </p>
              <p className="text-gray-700">
                To create your own page and have it show up in the app
                navigation, add a page inside <code className="bg-gray-100 px-2 py-1 rounded text-sm">app/routes</code>, and a
                link to it in the <code className="bg-gray-100 px-2 py-1 rounded text-sm">&lt;NavMenu&gt;</code> component found
                in <code className="bg-gray-100 px-2 py-1 rounded text-sm">app/routes/app.jsx</code>.
              </p>
            </div>
          </BiypodCard>
        </div>
        <div>
          <BiypodCard>
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Resources
              </h2>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://shopify.dev/docs/apps/design-guidelines/navigation#app-nav"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary-dark underline"
                  >
                    App nav best practices
                  </a>
                </li>
              </ul>
            </div>
          </BiypodCard>
        </div>
      </div>
    </div>
  );
}


