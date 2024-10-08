/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

const CSVController = () => import('#controllers/csv_controller')

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router.post('/import', [CSVController, 'import'])
