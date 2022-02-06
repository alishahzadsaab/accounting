import model from 'esaint/model';
import QuotationSettings from '../QuotationSettings/QuotationSettings';

export default model.extend(QuotationSettings, {
  name: 'SalesOrderSettings',
  label: 'Sales Order Settings',
  fields: [
    {
      fieldname: 'numberSeries',
      default: 'SO',
    },
  ],
});
