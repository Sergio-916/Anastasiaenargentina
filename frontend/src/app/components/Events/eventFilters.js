export const EVENT_TYPES = {
  short: "short",
  long: "long",
};

export function filterEventsByType(events, eventType) {
  return events.filter((event) => {
    const isSelectedType =
      eventType === EVENT_TYPES.long ? event.is_long_term : !event.is_long_term;

    return isSelectedType;
  });
}

export function getEventTypeForSlug(events, slug) {
  const event = events.find((item) => item.slug === slug);

  return event?.is_long_term ? EVENT_TYPES.long : EVENT_TYPES.short;
}
