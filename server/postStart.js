import esaint from 'esaint';
import naming from 'esaint/model/naming';
import GSTR3BServer from '../models/doctype/GSTR3B/GSTR3BServer.js';
import JournalEntryServer from '../models/doctype/JournalEntry/JournalEntryServer.js';
import PartyServer from '../models/doctype/Party/PartyServer.js';
import PaymentServer from '../models/doctype/Payment/PaymentServer.js';
import PurchaseInvoiceServer from '../models/doctype/PurchaseInvoice/PurchaseInvoiceServer.js';
import SalesInvoiceServer from '../models/doctype/SalesInvoice/SalesInvoiceServer.js';
import registerServerMethods from './registerServerMethods';

export default async function postStart() {
  // set server-side modules
  esaint.models.SalesInvoice.documentClass = SalesInvoiceServer;
  esaint.models.Payment.documentClass = PaymentServer;
  esaint.models.Party.documentClass = PartyServer;
  esaint.models.PurchaseInvoice.documentClass = PurchaseInvoiceServer;
  esaint.models.JournalEntry.documentClass = JournalEntryServer;
  esaint.models.GSTR3B.documentClass = GSTR3BServer;

  esaint.metaCache = {};

  // init naming series if missing
  await naming.createNumberSeries('SINV-', 'SalesInvoiceSettings');
  await naming.createNumberSeries('PINV-', 'PurchaseInvoiceSettings');
  await naming.createNumberSeries('PAY-', 'PaymentSettings');
  await naming.createNumberSeries('JV-', 'JournalEntrySettings');
  await naming.createNumberSeries('QTN-', 'QuotationSettings');
  await naming.createNumberSeries('SO-', 'SalesOrderSettings');
  await naming.createNumberSeries('OF-', 'FulfillmentSettings');
  await naming.createNumberSeries('PO-', 'PurchaseOrderSettings');
  await naming.createNumberSeries('PREC-', 'PurchaseReceiptSettings');

  // fetch singles
  // so that they are available synchronously
  await esaint.getSingle('SystemSettings');
  await esaint.getSingle('AccountingSettings');
  await esaint.getSingle('GetStarted');

  // cache currency symbols for esaint.format
  await setCurrencySymbols();

  registerServerMethods();
}

export async function setCurrencySymbols() {
  esaint.currencySymbols = await esaint.db
    .getAll({
      doctype: 'Currency',
      fields: ['name', 'symbol'],
    })
    .then((data) => {
      return data.reduce((obj, currency) => {
        obj[currency.name] = currency.symbol;
        return obj;
      }, {});
    });
}
