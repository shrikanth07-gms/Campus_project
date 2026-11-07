import { CheckCircle2, Clock, AlertCircle, XCircle, ArrowRightCircle } from 'lucide-react';

export default function TimelineStepper({ stages = [], currentStageIndex = 0, currentReviewer = '' }) {
  return (
    <div style={{ padding: '10px 0' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {stages.map((stage, index) => {
          const isDone = stage.status === 'approved';
          const isCurrent = stage.status === 'in_progress';
          const isCorrection = stage.status === 'correction_required';
          const isRejected = stage.status === 'rejected';
          const isPending = stage.status === 'pending';

          let icon = <Clock size={18} color="var(--gray-400)" />;
          let iconBg = 'var(--gray-100)';
          let borderColor = 'var(--gray-200)';
          let badgeText = 'Pending';
          let badgeBg = 'var(--gray-100)';
          let badgeColor = 'var(--gray-600)';

          if (isDone) {
            icon = <CheckCircle2 size={18} color="white" />;
            iconBg = 'var(--success-500)';
            borderColor = 'var(--success-500)';
            badgeText = 'Approved';
            badgeBg = 'var(--success-50)';
            badgeColor = 'var(--success-700)';
          } else if (isCurrent) {
            icon = <Clock size={18} color="white" />;
            iconBg = 'var(--primary-600)';
            borderColor = 'var(--primary-500)';
            badgeText = 'Under Review';
            badgeBg = 'var(--primary-50)';
            badgeColor = 'var(--primary-700)';
          } else if (isCorrection) {
            icon = <AlertCircle size={18} color="white" />;
            iconBg = 'var(--warning-500)';
            borderColor = 'var(--warning-500)';
            badgeText = 'Correction Requested';
            badgeBg = 'var(--warning-50)';
            badgeColor = 'var(--warning-700)';
          } else if (isRejected) {
            icon = <XCircle size={18} color="white" />;
            iconBg = 'var(--danger-500)';
            borderColor = 'var(--danger-500)';
            badgeText = 'Rejected';
            badgeBg = 'var(--danger-50)';
            badgeColor = 'var(--danger-700)';
          }

          return (
            <div
              key={index}
              style={{
                display: 'flex',
                gap: '16px',
                position: 'relative'
              }}
            >
              {/* Connecting vertical line */}
              {index < stages.length - 1 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '32px',
                    left: '16px',
                    bottom: '-22px',
                    width: '2px',
                    backgroundColor: isDone ? 'var(--success-500)' : 'var(--gray-200)',
                    zIndex: 1
                  }}
                />
              )}

              {/* Step Icon */}
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                  boxShadow: 'var(--shadow-sm)',
                  flexShrink: 0
                }}
              >
                {icon}
              </div>

              {/* Step Info */}
              <div
                style={{
                  flex: 1,
                  background: isCurrent ? 'var(--primary-50)' : 'var(--gray-50)',
                  border: `1px solid ${isCurrent ? 'var(--primary-100)' : 'var(--gray-200)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 18px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--gray-900)' }}>
                      Stage {index + 1}: {stage.name}
                    </h4>
                    <div style={{ fontSize: '13px', color: 'var(--gray-500)', marginTop: '2px' }}>
                      Reviewer: <strong>{stage.reviewer || currentReviewer || 'Designated Authority'}</strong>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '12px',
                      backgroundColor: badgeBg,
                      color: badgeColor,
                      textTransform: 'uppercase'
                    }}
                  >
                    {badgeText}
                  </span>
                </div>

                {stage.timestamp && (
                  <div style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '6px' }}>
                    Action taken: {new Date(stage.timestamp).toLocaleString()}
                  </div>
                )}

                {stage.notes && (
                  <div
                    style={{
                      marginTop: '8px',
                      padding: '8px 12px',
                      backgroundColor: 'white',
                      border: '1px solid var(--gray-200)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '13px',
                      color: 'var(--gray-700)'
                    }}
                  >
                    <strong>Reviewer Note:</strong> {stage.notes}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

