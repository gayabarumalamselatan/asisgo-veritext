'use client';

interface WorkflowStepProps {
  steps: Array<{ id: string; label: string; description: string }>;
  currentStep: string;
  onStepClick?: (step: string) => void;
}

export function WorkflowProgress({ steps, currentStep, onStepClick }: WorkflowStepProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-2 mb-8 px-4">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = index < currentIndex;
          const isUpcoming = index > currentIndex;

          return (
            <div key={step.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center flex-1">
                <button
                  onClick={() => onStepClick?.(step.id)}
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm
                    transition-all duration-200
                    ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : isCompleted
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-muted text-muted-foreground border-2 border-border'
                    }
                  `}
                >
                  {isCompleted ? '✓' : index + 1}
                </button>
                <div className="mt-3 text-center">
                  <p className={`text-xs font-semibold ${isActive ? 'text-primary' : 'text-foreground'}`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`
                    h-1 flex-1 mx-2 rounded-full
                    ${isCompleted || isActive ? 'bg-accent' : 'bg-border'}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
