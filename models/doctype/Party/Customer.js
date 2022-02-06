import router from '@/router';
import esaint from 'esaint';
import { t } from 'esaint';
import PartyWidget from './PartyWidget.vue';

export default {
  name: 'Customer',
  label: 'Customer',
  basedOn: 'Party',
  filters: {
    customer: 1,
  },
  actions: [
    {
      label: t('Create Invoice'),
      condition: (doc) => !doc.isNew(),
      action: async (customer) => {
        let doc = await esaint.getNewDoc('SalesInvoice');
        router.push({
          path: `/edit/SalesInvoice/${doc.name}`,
          query: {
            doctype: 'SalesInvoice',
            values: {
              customer: customer.name,
            },
          },
        });
      },
    },
    {
      label: t('View Invoices'),
      condition: (doc) => !doc.isNew(),
      action: (customer) => {
        router.push({
          name: 'ListView',
          params: {
            doctype: 'SalesInvoice',
            filters: {
              customer: customer.name,
            },
          },
        });
      },
    },
  ],
  quickEditWidget: (doc) => ({
    render(h) {
      return h(PartyWidget, {
        props: { doc },
      });
    },
  }),
};
