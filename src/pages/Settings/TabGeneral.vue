<template>
  <div>
    <TwoColumnForm
      v-if="doc"
      :doc="doc"
      :fields="fields"
      :autosave="true"
      :emit-change="true"
      @change="forwardChangeEvent"
    />
  </div>
</template>

<script>
import esaint from 'esaint';
import TwoColumnForm from '@/components/TwoColumnForm';

export default {
  name: 'TabGeneral',
  components: {
    TwoColumnForm,
  },
  data() {
    return {
      doc: null,
    };
  },
  async mounted() {
    this.doc = await esaint.getDoc('AccountingSettings', 'AccountingSettings', {
      skipDocumentCache: true,
    });
  },
  computed: {
    fields() {
      let meta = esaint.getMeta('AccountingSettings');
      return [
        'companyName',
        'country',
        'bankName',
        'currency',
        'writeOffAccount',
        'roundOffAccount',
        'fiscalYearStart',
        'fiscalYearEnd',
        'gstin',
      ].map((fieldname) => meta.getField(fieldname));
    },
  },
  methods: {
    forwardChangeEvent(...args) {
      this.$emit('change', ...args);
    },
  },
};
</script>
