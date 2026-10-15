import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, Clock, Ban } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  type?: 'risk' | 'check' | 'category' | 'approval';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'check' }) => {
  const s = status.toUpperCase().trim();

  if (type === 'risk') {
    let cls = 'badge-low';
    if (s === 'CRITICAL') cls = 'badge-critical';
    else if (s === 'HIGH') cls = 'badge-high';
    else if (s === 'MEDIUM') cls = 'badge-medium';
    return <span className={`badge ${cls}`}>{status}</span>;
  }

  if (type === 'approval') {
    if (s === 'APPROVED') {
      return (
        <span className="badge badge-pass">
          <CheckCircle2 size={12} /> Approved
        </span>
      );
    }
    if (s === 'REJECTED') {
      return (
        <span className="badge badge-fail">
          <XCircle size={12} /> Rejected
        </span>
      );
    }
    return (
      <span className="badge badge-not-run">
        <Clock size={12} /> Pending Review
      </span>
    );
  }

  // Verification Check types
  if (s === 'PASS' || s === 'PASSED' || s === 'VERIFIED') {
    return (
      <span className="badge badge-pass">
        <CheckCircle2 size={12} /> Pass
      </span>
    );
  }
  if (s === 'FAIL' || s === 'FAILED') {
    return (
      <span className="badge badge-fail">
        <XCircle size={12} /> Fail
      </span>
    );
  }
  if (s === 'INCONCLUSIVE' || s === 'PARTIAL') {
    return (
      <span className="badge badge-inconclusive">
        <AlertCircle size={12} /> Inconclusive
      </span>
    );
  }
  if (s === 'AI_CLAIM_REJECTED') {
    return (
      <span className="badge badge-rejected">
        <Ban size={12} /> Claim Rejected
      </span>
    );
  }
  if (s === 'UNVERIFIED') {
    return (
      <span className="badge badge-medium">
        <AlertCircle size={12} /> Unverified
      </span>
    );
  }

  return (
    <span className="badge badge-not-run">
      <Clock size={12} /> {status}
    </span>
  );
};
