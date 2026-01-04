import moment from "moment-timezone";

/**
 * Format a date with timezone support.
 */
export function formatDate(
  date?: Date | string | number | null,
  format: string = "MMM D, YYYY",
  timezone: string = "UTC"
): string {
  let selectedTimezone = timezone;

  // Validate timezone
  if (!moment.tz.zone(timezone)) {
    selectedTimezone = "UTC";
  }

  // Handle null/undefined - return current date
  if (date == null) {
    return moment().tz(selectedTimezone).format(format);
  }

  // Create moment object from input
  const momentDate = moment(date).tz(selectedTimezone);

  // Validate the date
  if (!momentDate.isValid()) {
    return "";
  }

  return momentDate.format(format);
}
