export const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
};

export const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const formatDateTime = (dateStr) => {
  return new Date(dateStr).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTime = (dateStr) => {
  return new Date(dateStr).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getStatusBadge = (status) => {
  const map = {
    pending_payment: { label: 'Menunggu Bayar', className: 'badge-warning' },
    paid: { label: 'Sudah Bayar', className: 'badge-info' },
    processing: { label: 'Diproses', className: 'badge-primary' },
    completed: { label: 'Selesai', className: 'badge-success' },
    cancelled: { label: 'Dibatalkan', className: 'badge-danger' },
  };
  return map[status] || { label: status, className: 'badge-info' };
};
