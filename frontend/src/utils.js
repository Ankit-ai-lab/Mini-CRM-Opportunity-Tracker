export const stageBadgeClass = (stage) => {
  const map = {
    New: 'badge-stage-new',
    Contacted: 'badge-stage-contacted',
    Qualified: 'badge-stage-qualified',
    'Proposal Sent': 'badge-stage-proposal-sent',
    Won: 'badge-stage-won',
    Lost: 'badge-stage-lost',
  };
  return map[stage] || 'badge-stage-new';
};

export const priorityBadgeClass = (priority) => {
  const map = {
    Low: 'badge-priority-low',
    Medium: 'badge-priority-medium',
    High: 'badge-priority-high',
  };
  return map[priority] || 'badge-priority-low';
};

export const formatCurrency = (value) => {
  const num = Number(value) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
};

export const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const toDateInputValue = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

export const extractErrorMessage = (error, fallback = 'Something went wrong') => {
  if (error?.response?.data?.errors?.length) {
    return error.response.data.errors.map((e) => e.message).join('. ');
  }
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message) return error.message;
  return fallback;
};

export const STAGES = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'];
export const PRIORITIES = ['Low', 'Medium', 'High'];
