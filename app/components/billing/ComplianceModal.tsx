import { useState } from "react";
import { BiypodButton } from "../ui/BiypodButton";
import {
  PlanType,
  BIYPOD_PLANS,
  PLAN_COMPLIANCE_ITEMS,
  getPlanDisplayName,
  getPlanPricing
} from "../../lib/billing/plans";

interface ComplianceModalProps {
  planType: PlanType;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ComplianceModal({ planType, onConfirm, onCancel }: ComplianceModalProps) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [selectAll, setSelectAll] = useState(false);

  const plan = BIYPOD_PLANS[planType];
  const pricing = getPlanPricing(planType);
  const requiredItems = PLAN_COMPLIANCE_ITEMS.filter(item => item.required);
  const optionalItems = PLAN_COMPLIANCE_ITEMS.filter(item => !item.required);

  const handleItemCheck = (itemId: string, checked: boolean) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: checked
    }));
  };

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    
    const newCheckedItems: Record<string, boolean> = {};
    PLAN_COMPLIANCE_ITEMS.forEach(item => {
      newCheckedItems[item.id] = newSelectAll;
    });
    setCheckedItems(newCheckedItems);
  };

  const allRequiredChecked = requiredItems.every(item => checkedItems[item.id]);
  const canContinue = allRequiredChecked;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Confirm Your {getPlanDisplayName(planType)} Plan
          </h2>
          <p className="text-gray-600">
            Please review the plan details and agree to the terms below.
          </p>
        </div>

        {/* Plan Summary */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Plan Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Monthly Fee:</span>
                  <span className="font-semibold">{pricing.recurring}</span>
                </div>
                <div className="flex justify-between">
                  <span>Usage Fee:</span>
                  <span className="font-semibold">{pricing.usageFee}</span>
                </div>
                <div className="flex justify-between">
                  <span>Product Limit:</span>
                  <span className="font-semibold">{plan.productLimit} products</span>
                </div>
                {plan.trialDays && (
                  <div className="flex justify-between text-green-600">
                    <span>Free Trial:</span>
                    <span className="font-semibold">{plan.trialDays} days</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">What's Included</h3>
              <ul className="space-y-1 text-sm">
                {plan.features.slice(0, 4).map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Compliance Section */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Terms & Compliance</h3>
            <BiypodButton
              onClick={handleSelectAll}
              variant="outline"
              size="sm"
            >
              {selectAll ? "Deselect All" : "Select All"}
            </BiypodButton>
          </div>

          {/* Required Items */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Required (must agree to continue)</h4>
            <div className="space-y-3">
              {requiredItems.map((item) => (
                <label key={item.id} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedItems[item.id] || false}
                    onChange={(e) => handleItemCheck(item.id, e.target.checked)}
                    className="mt-1 h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <div className="flex-1">
                    <span className="text-sm text-gray-900">{item.label}</span>
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-primary hover:text-primary-dark text-sm underline"
                      >
                        View
                      </a>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Optional Items */}
          {optionalItems.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Optional</h4>
              <div className="space-y-3">
                {optionalItems.map((item) => (
                  <label key={item.id} className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checkedItems[item.id] || false}
                      onChange={(e) => handleItemCheck(item.id, e.target.checked)}
                      className="mt-1 h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm text-gray-900">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Billing Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <svg className="w-5 h-5 text-blue-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm">
                <p className="text-blue-800 font-medium mb-1">Billing Information</p>
                <p className="text-blue-700">
                  You'll be redirected to Shopify's secure billing system to approve this subscription. 
                  {plan.trialDays && ` Your ${plan.trialDays}-day free trial starts immediately.`}
                  {planType === 'free' && " No recurring charges - only usage fees apply."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <BiypodButton
            onClick={onCancel}
            variant="outline"
          >
            Cancel
          </BiypodButton>
          <BiypodButton
            onClick={onConfirm}
            disabled={!canContinue}
            variant="primary"
          >
            Continue to Billing
          </BiypodButton>
        </div>
      </div>
    </div>
  );
}
