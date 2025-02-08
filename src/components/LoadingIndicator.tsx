interface LoadingStep {
  id: string
  label: string
  status: 'pending' | 'loading' | 'complete'
}

interface LoadingIndicatorProps {
  steps: LoadingStep[]
  onComplete?: () => void
}

export function LoadingIndicator({ steps }: LoadingIndicatorProps) {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="w-full max-w-md space-y-4 rounded-lg border bg-white p-8 shadow-sm">
        <h3 className="text-center text-lg font-medium">Loading your data</h3>
        <div className="space-y-3">
          {steps.map((step, index) => {
            const isActive = step.status === 'loading'
            const isComplete = step.status === 'complete'

            return (
              <div
                key={step.id}
                className="flex items-center gap-3 rounded-md border bg-gray-50 p-3 transition-all duration-200"
                style={{
                  transform: isActive ? 'scale(1.02)' : 'scale(1)',
                  borderColor: isComplete
                    ? '#22c55e'
                    : isActive
                      ? '#3b82f6'
                      : '#e5e7eb',
                }}
              >
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-sm ${
                    isComplete
                      ? 'bg-green-500 text-white'
                      : isActive
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isComplete ? '✓' : index + 1}
                </div>
                <span
                  className={
                    isComplete
                      ? 'text-green-700'
                      : isActive
                        ? 'text-blue-700'
                        : 'text-gray-500'
                  }
                >
                  {step.label}
                </span>
                {isActive && (
                  <div className="ml-auto flex items-center gap-2">
                    <div
                      className="h-1.5 w-1.5 animate-[bounce_1s_infinite] rounded-full bg-blue-500"
                      style={{ animationDelay: '0ms' }}
                    />
                    <div
                      className="h-1.5 w-1.5 animate-[bounce_1s_infinite] rounded-full bg-blue-500"
                      style={{ animationDelay: '200ms' }}
                    />
                    <div
                      className="h-1.5 w-1.5 animate-[bounce_1s_infinite] rounded-full bg-blue-500"
                      style={{ animationDelay: '400ms' }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
