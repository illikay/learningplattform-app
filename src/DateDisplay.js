import React from 'react';
import { format, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { de } from 'date-fns/locale';



const DateDisplay = ({ utcDateTime }) => {
  const timeZone = 'Europe/Berlin';
  const formatString = 'dd.MM.yyyy HH:mm:ss';

  if (!utcDateTime) {
    return <td>Invalid date</td>;
  }

  // Entfernen der Zeitzonenangabe und Konvertierung in ein ISO-Datum
  const isoDateTime = utcDateTime.split('[')[0];

  let dateTimeInGermany;
  try {
    // Konvertierung in ein Date-Objekt
    const date = parseISO(isoDateTime);
    if (isNaN(date)) {
      throw new Error('Invalid date');
    }
    // Konvertierung in die deutsche Zeit
    dateTimeInGermany = toZonedTime(date, timeZone);
  } catch (error) {
    console.error('Invalid date format:', utcDateTime);
    return <td>Invalid date</td>;
  }

  // Formatierung der Daten
  const formattedDateTime = format(dateTimeInGermany, formatString, { locale: de });

  return formattedDateTime;
};

export default DateDisplay;
