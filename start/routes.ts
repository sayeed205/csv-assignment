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
const DocsController = () => import('#controllers/docs_controller')

/*
|--------------------------------------------------------------------------
| API Docs routes
|--------------------------------------------------------------------------
*/
router.get('/', ({ response }) => response.redirect('/api/docs'))
router
  .group(() => {
    router.get('/', [DocsController, 'docs'])
    router.get('/swagger', [DocsController, 'swagger'])
  })
  .prefix('/api/docs')

router.get('/fs', () =>
  router
    .builder()
    .params(['products', 'images', 'k4xwfhj924keiubf7beyjbic.jpg'])
    .make('drive.fs.serve')
)

/*
|--------------------------------------------------------------------------
| csv routes
|--------------------------------------------------------------------------
*/
router.post('/csv/import', [CSVController, 'import'])
router.get('/csv/:id/status', [CSVController, 'status'])
router.get('/csv/:id/output', [CSVController, 'output'])
