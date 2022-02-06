import esaint from 'esaint';
import BaseDocument from 'esaint/model/document';

export default class Account extends BaseDocument {
  async validate() {
    if (!this.accountType && this.parentAccount) {
      this.accountType = await esaint.db.getValue(
        'Account',
        this.parentAccount,
        'accountType'
      );
    }
  }
}
