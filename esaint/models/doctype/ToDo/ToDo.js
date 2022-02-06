import { indicators } from '../../../../src/colors';
const { BLUE, GREEN } = indicators;

export const name = 'ToDo';
export const label = 'To Do';
export const naming = 'autoincrement';
export const isSingle = 0;
export const keywordFields = ['subject', 'description'];
export const titleField = 'subject';
export const indicators = {
  key: 'status',
  colors: {
    Open: BLUE,
    Closed: GREEN,
  },
};
export const fields = [
  {
    fieldname: 'subject',
    label: 'Subject',
    placeholder: 'Subject',
    fieldtype: 'Data',
    required: 1,
  },
  {
    fieldname: 'status',
    label: 'Status',
    fieldtype: 'Select',
    options: ['Open', 'Closed'],
    default: 'Open',
    required: 1,
  },
  {
    fieldname: 'description',
    label: 'Description',
    fieldtype: 'Text',
  },
];
export const quickEditFields = ['status', 'description'];
export const actions = [
  {
    label: 'Close',
    condition: (doc) => doc.status !== 'Closed',
    action: async (doc) => {
      await doc.set('status', 'Closed');
      await doc.update();
    },
  },
  {
    label: 'Re-Open',
    condition: (doc) => doc.status !== 'Open',
    action: async (doc) => {
      await doc.set('status', 'Open');
      await doc.update();
    },
  },
];
