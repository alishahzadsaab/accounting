import esaint from 'esaint';

export default {
  async getPayments() {
    let payments = await esaint.db.getAll({
      doctype: 'PaymentFor',
      fields: ['parent'],
      filters: { referenceName: this.name },
      orderBy: 'name',
    });
    if (payments.length != 0) {
      return payments;
    }
    return [];
  },

  async beforeUpdate() {
    const entries = await this.getPosting();
    await entries.validateEntries();
  },

  async beforeInsert() {
    const entries = await this.getPosting();
    await entries.validateEntries();
  },

  async afterSubmit() {
    // post ledger entries
    const entries = await this.getPosting();
    await entries.post();

    // update outstanding amounts
    await esaint.db.setValue(
      this.doctype,
      this.name,
      'outstandingAmount',
      this.baseGrandTotal
    );

    let party = await esaint.getDoc('Party', this.customer || this.supplier);
    await party.updateOutstandingAmount();
  },

  async afterRevert() {
    let paymentRefList = await this.getPayments();
    for (let paymentFor of paymentRefList) {
      const paymentReference = paymentFor.parent;
      const payment = await esaint.getDoc('Payment', paymentReference);
      const paymentEntries = await payment.getPosting();
      await paymentEntries.postReverse();
      // To set the payment status as unsubmitted.
      await esaint.db.update('Payment', {
        name: paymentReference,
        submitted: 0,
        cancelled: 1,
      });
    }
    const entries = await this.getPosting();
    await entries.postReverse();
  },
};
