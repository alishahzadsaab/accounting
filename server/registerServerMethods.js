import esaint from 'esaint';
import importCharts from '../accounting/importCOA';
import registerReportMethods from '../reports';

export default function registerServerMethods() {
  registerReportMethods();

  esaint.registerMethod({
    method: 'import-coa',
    async handler() {
      await importCharts();
    },
  });
}
