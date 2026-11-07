import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Send, 
  ArrowRightCircle, 
  FileCheck,
  AlertTriangle,
  Calendar
} from 'lucide-react';

export function StatusBadge({ status }) {
  const normalized = (status || 'submitted').toLowerCase().replace(' ', '_');

  const configs = {
    submitted: {
      label: 'Submitted',
      icon: Send,
      className: 'status-submitted'
    },
    under_review: {
      label: 'Under Review',
      icon: Clock,
      className: 'status-under_review'
    },
    in_progress: {
      label: 'In Progress',
      icon: Clock,
      className: 'status-in_progress'
    },
    correction_required: {
      label: 'Correction Required',
      icon: AlertCircle,
      className: 'status-correction_required'
    },
    rejected: {
      label: 'Rejected',
      icon: XCircle,
      className: 'status-rejected'
    },
    physical_signature: {
      label: 'Physical Signature Required',
      icon: FileCheck,
      className: 'status-physical_signature'
    },
    forwarded: {
      label: 'Forwarded',
      icon: ArrowRightCircle,
      className: 'status-forwarded'
    },
    approved: {
      label: 'Approved',
      icon: CheckCircle,
      className: 'status-approved'
    },
    completed: {
      label: 'Completed',
      icon: FileCheck,
      className: 'status-completed'
    }
  };

  const config = configs[normalized] || configs.submitted;
  const Icon = config.icon;

  return (
    <span className={`status-badge ${config.className}`}>
      <Icon size={13} />
      <span>{config.label}</span>
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const normalized = (priority || 'this_week').toLowerCase();

  const configs = {
    urgent: {
      label: 'Urgent',
      icon: AlertTriangle,
      className: 'priority-urgent'
    },
    this_week: {
      label: 'This Week',
      icon: Clock,
      className: 'priority-this_week'
    },
    this_month: {
      label: 'This Month',
      icon: Calendar,
      className: 'priority-this_month'
    }
  };

  const config = configs[normalized] || configs.this_week;
  const Icon = config.icon;

  return (
    <span className={`priority-badge ${config.className}`}>
      <Icon size={12} />
      <span>{config.label}</span>
    </span>
  );
}

