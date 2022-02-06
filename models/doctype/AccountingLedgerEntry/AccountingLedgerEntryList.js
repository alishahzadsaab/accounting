import { t } from 'esaint';

export default {
  doctype: 'AccountingLedgerEntry',
  title: t('Accounting Ledger Entries'),
  columns: ['account', 'party', 'debit', 'credit', 'balance'],
};
