export const EVENT_TYPES = {
  short: "short",
  long: "long",
};

function dateKeyFromDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getActiveUntilDate(event) {
  if (event.end_date) {
    return event.end_date;
  }

  if (event.is_long_term) {
    return null;
  }

  return event.start_date;
}

export function isActiveEvent(event, today = new Date()) {
  const activeUntilDate = getActiveUntilDate(event);

  if (!activeUntilDate) {
    return true;
  }

  return activeUntilDate >= dateKeyFromDate(today);
}

export function filterEventsByType(events, eventType) {
  return events.filter((event) => {
    const isSelectedType =
      eventType === EVENT_TYPES.long ? event.is_long_term : !event.is_long_term;

    return isSelectedType && isActiveEvent(event);
  });
}

export function getEventTypeForSlug(events, slug) {
  const event = events.find((item) => item.slug === slug);

  return event?.is_long_term ? EVENT_TYPES.long : EVENT_TYPES.short;
}
