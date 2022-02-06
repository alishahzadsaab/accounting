const luxon = require('luxon');
const esaint = require('esaint');
const { DEFAULT_DISPLAY_PRECISION, DEFAULT_LOCALE } = require('./consts');

module.exports = {
  format(value, df, doc) {
    if (!df) {
      return value;
    }

    if (typeof df === 'string') {
      df = { fieldtype: df };
    }

    if (df.fieldtype === 'Currency') {
      const currency = getCurrency(df, doc);
      value = formatCurrency(value, currency);
    } else if (df.fieldtype === 'Date') {
      let dateFormat;
      if (!esaint.SystemSettings) {
        dateFormat = 'yyyy-MM-dd';
      } else {
        dateFormat = esaint.SystemSettings.dateFormat;
      }

      if (typeof value === 'string') {
        // ISO String
        value = luxon.DateTime.fromISO(value);
      } else if (Object.prototype.toString.call(value) === '[object Date]') {
        // JS Date
        value = luxon.DateTime.fromJSDate(value);
      }

      value = value.toFormat(dateFormat);
      if (value === 'Invalid DateTime') {
        value = '';
      }
    } else if (df.fieldtype === 'Check') {
      typeof parseInt(value) === 'number'
        ? (value = parseInt(value))
        : (value = Boolean(value));
    } else {
      if (value === null || value === undefined) {
        value = '';
      } else {
        value = value + '';
      }
    }
    return value;
  },
  formatCurrency,
  formatNumber,
};

function formatCurrency(value, currency) {
  let valueString;
  try {
    valueString = formatNumber(value);
  } catch (err) {
    err.message += ` value: '${value}', type: ${typeof value}`;
    throw err;
  }

  const currencySymbol = esaint.currencySymbols[currency];
  if (currencySymbol) {
    return currencySymbol + ' ' + valueString;
  }

  return valueString;
}

function formatNumber(value) {
  const numberFormatter = getNumberFormatter();
  if (typeof value === 'number') {
    return numberFormatter.format(value);
  }

  if (value.round) {
    return numberFormatter.format(value.round());
  }

  const formattedNumber = numberFormatter.format(value);
  if (formattedNumber === 'NaN') {
    throw Error(
      `invalid value passed to formatNumber: '${value}' of type ${typeof value}`
    );
  }

  return formattedNumber;
}

function getNumberFormatter() {
  if (esaint.currencyFormatter) {
    return esaint.currencyFormatter;
  }

  const locale = esaint.SystemSettings.locale ?? DEFAULT_LOCALE;
  const display =
    esaint.SystemSettings.displayPrecision ?? DEFAULT_DISPLAY_PRECISION;

  return (esaint.currencyFormatter = Intl.NumberFormat(locale, {
    style: 'decimal',
    minimumFractionDigits: display,
  }));
}

function getCurrency(df, doc) {
  if (!(doc && df.getCurrency)) {
    return df.currency || esaint.AccountingSettings.currency || '';
  }

  if (doc.meta && doc.meta.isChild) {
    return df.getCurrency(doc, doc.parentdoc);
  }

  return df.getCurrency(doc);
}
