import model from 'esaint/model';
import PurchaseOrderSettings from '../PurchaseOrderSettings/PurchaseOrderSettings';

export default model.extend(PurchaseOrderSettings, {
  name: 'PurchaseReceiptSettings',
  label: 'Purchase Receipt Settings',
  fields: [
    {
      fieldname: 'numberSeries',
      default: 'PREC',
    },
  ],
});
