
export default [
  {
    path: '/list/:doctype',
    name: 'List',
    component: () => import('frappejs/ui/pages/ListAndForm'),
    props: true
  },

  {
    path: '/edit/:doctype/:name',
    name: 'Form',
    component: () => import('frappejs/ui/pages/ListAndForm'),
    props: true
  },

  {
    path: '/setup-wizard',
    name: 'SetupWizard',
    components: {
      setup: () => import('pages/SetupWizard')
    }
  }
]
