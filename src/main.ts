import { createApp } from 'vue'
import { Quasar } from 'quasar'
import App from './App.vue'
import 'events'

// @ts-ignore
PouchDB.plugin(PouchDBGeospatial)

// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/material-icons-outlined/material-icons-outlined.css'
import '@quasar/extras/roboto-font/roboto-font.css'

// Import Quasar css
import 'quasar/src/css/index.sass'

const app = createApp(App)

app.use(Quasar, {
  plugins: {}, // import Quasar plugins and add here
})

app.mount('#app')
