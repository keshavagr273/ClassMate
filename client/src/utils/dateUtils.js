export const formatDateTime = (dateTime) => {
  if (!dateTime) return "Unknown";
  return new Date(dateTime).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatDate = (dateTime) => {
  if (!dateTime) return "Unknown";
  return new Date(dateTime).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const formatTime = (dateTime) => {
  if (!dateTime) return "Unknown";
  return new Date(dateTime).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const isRideActive = (departureDateTime) => {
  if (!departureDateTime) return false;
  return new Date(departureDateTime) > new Date();
};

// Convert ISO string or Date object to local 'YYYY-MM-DDTHH:mm' for datetime-local input
export const toLocalDateTimeInput = (dateInput) => {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Convert local 'YYYY-MM-DDTHH:mm' to UTC ISO string
export const toISOString = (localDateTimeStr) => {
  if (!localDateTimeStr) return null;
  const date = new Date(localDateTimeStr);
  return isNaN(date.getTime()) ? localDateTimeStr : date.toISOString();
};
