export function formatDateRange(event) {
  const startDate = new Date(`${event.start_date}T00:00:00`);
  const endDate = event.end_date
    ? new Date(`${event.end_date}T00:00:00`)
    : null;
  const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (!endDate || event.start_date === event.end_date) {
    return dateFormatter.format(startDate);
  }

  return `${dateFormatter.format(startDate)} - ${dateFormatter.format(endDate)}`;
}

export function formatTime(event) {
  if (!event.start_time_local && !event.end_time_local) {
    return null;
  }
  if (event.start_time_local && event.end_time_local) {
    return `${event.start_time_local} - ${event.end_time_local}`;
  }
  return event.start_time_local || event.end_time_local;
}

export function formatPrice(event) {
  if (event.price_type === "free") {
    return "Бесплатно";
  }
  if (event.price_value) {
    return `${event.price_value} ${event.price_currency || ""}`.trim();
  }
  if (event.price_type === "paid") {
    return "Платно";
  }
  return "Уточните цену";
}
