import esaint from 'esaint';
import BaseDocument from 'esaint/model/document';

export default class PartyServer extends BaseDocument {
  beforeInsert() {
    if (this.customer && this.supplier) {
      esaint.call({
        method: 'show-dialog',
        args: {
          title: 'Invalid Entry',
          message: 'Select a single party type.',
        },
      });
      throw new Error();
    }

    if (!this.customer && !this.supplier) {
      this.supplier = 1;
    }

    if (this.gstin && ['Unregistered', 'Consumer'].includes(this.gstType)) {
      this.gstin = '';
    }
  }

  async updateOutstandingAmount() {
    let isCustomer = this.customer;
    let doctype = isCustomer ? 'SalesInvoice' : 'PurchaseInvoice';
    let partyField = isCustomer ? 'customer' : 'supplier';

    const outstandingAmounts = await esaint.db.knex
      .select('outstandingAmount')
      .from(doctype)
      .where('submitted', 1)
      .andWhere(partyField, this.name);

    const totalOutstanding = outstandingAmounts
      .map(({ outstandingAmount }) => esaint.pesa(outstandingAmount))
      .reduce((a, b) => a.add(b), esaint.pesa(0));

    await this.set('outstandingAmount', totalOutstanding);
    await this.update();
  }
}
