const parseDateStringToUTC = function (dateString) {
  // Try parsing as UTC format
  const utcDate = new Date(dateString);
  if (!Number.isNaN(utcDate.getTime())) {
    return utcDate;
  }

  // Try parsing as the provided format for the first date string
  const parsedDate1 = new Date(dateString);
  if (!Number.isNaN(parsedDate1.getTime())) {
    return parsedDate1;
  }

  // Try parsing as the provided format for the second date string
  const parsedDate2 = new Date(Date.parse(dateString));
  if (!Number.isNaN(parsedDate2.getTime())) {
    return parsedDate2;
  }

  // If none of the formats match, return null or handle the error as needed
  return null;
};

module.exports = {
  parseDateStringToUTC,
};
