import { useState } from "react";
import { BiypodCard } from "../ui/BiypodCard";
import { BiypodButton } from "../ui/BiypodButton";
import { ComplianceModal } from "./ComplianceModal";
import {
  PlanType,
  BIYPOD_PLANS,
  getPlanDisplayName,
  getPlanPricing
} from "../../lib/billing/plans";

interface PlanSelectionProps {
  onPlanSelected: (planType: PlanType) => void;
  isLoading?: boolean;
}

export function PlanSelection({ onPlanSelected, isLoading = false }: PlanSelectionProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [showComplianceModal, setShowComplianceModal] = useState(false);

  const handlePlanSelect = (planType: PlanType) => {
    setSelectedPlan(planType);
    setShowComplianceModal(true);
  };

  const handleComplianceConfirm = () => {
    if (selectedPlan) {
      onPlanSelected(selectedPlan);
    }
    setShowComplianceModal(false);
  };

  const handleComplianceCancel = () => {
    setSelectedPlan(null);
    setShowComplianceModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Choose Your Biypod Plan
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Select the perfect plan for your customizable product business. 
            Start with a free trial and scale as you grow.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {(Object.keys(BIYPOD_PLANS) as PlanType[]).map((planType) => {
            const plan = BIYPOD_PLANS[planType];
            const pricing = getPlanPricing(planType);
            const isPopular = planType === 'starter';

            return (
              <div key={planType} className="relative">
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="bg-gradient-secondary text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <BiypodCard className={`h-full ${isPopular ? 'ring-4 ring-yellow-400' : ''}`}>
                  <div className="p-8">
                    {/* Plan Header */}
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {getPlanDisplayName(planType)}
                      </h3>
                      <div className="text-3xl font-bold text-primary mb-1">
                        {pricing.recurring}
                      </div>
                      <div className="text-sm text-gray-600">
                        + {pricing.usageFee}
                      </div>
                      {plan.trialDays && (
                        <div className="text-sm text-green-600 font-semibold mt-2">
                          {plan.trialDays}-day free trial
                        </div>
                      )}
                    </div>

                    {/* Features */}
                    <div className="mb-8">
                      <h4 className="font-semibold text-gray-900 mb-3">Features:</h4>
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Limitations */}
                    {plan.limitations.length > 0 && (
                      <div className="mb-8">
                        <h4 className="font-semibold text-gray-900 mb-3">Limitations:</h4>
                        <ul className="space-y-2">
                          {plan.limitations.map((limitation, index) => (
                            <li key={index} className="flex items-start">
                              <svg className="w-5 h-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm text-gray-600">{limitation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Select Button */}
                    <BiypodButton
                      onClick={() => handlePlanSelect(planType)}
                      disabled={isLoading}
                      variant={isPopular ? "primary" : "secondary"}
                      className="w-full"
                    >
                      {isLoading ? "Processing..." : `Select ${getPlanDisplayName(planType)}`}
                    </BiypodButton>
                  </div>
                </BiypodCard>
              </div>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="text-center text-blue-100">
          <p className="mb-2">
            All plans include our core 3D customization engine and customer design management.
          </p>
          <p className="text-sm">
            Usage fees are only charged on orders containing your published customizable products.
          </p>
        </div>
      </div>

      {/* Compliance Modal */}
      {showComplianceModal && selectedPlan && (
        <ComplianceModal
          planType={selectedPlan}
          onConfirm={handleComplianceConfirm}
          onCancel={handleComplianceCancel}
        />
      )}
    </div>
  );
}
