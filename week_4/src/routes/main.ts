
import express, {Response, Request} from 'express';
import { dbHandler } from '../database_integration/DataBaseWorker';
import { getEmployeeId } from '../utils/utils';
import { authenticationMiddleware } from '../config/passportConfig';


const router = express.Router();

<<<<<<< HEAD
router.get('/', async (req: Request, res: Response) => {
  const name = req.query.name || undefined;
  res.render('main', { name });
=======
router.get('/', authenticationMiddleware, async (req: Request, res: Response) => {
  res.render('main');
>>>>>>> 106e7bad2a44130ce8bc2fc7ef16de6180f7dfce
});

router.post('/', async (req, res) => {
  const { employeeName, action } = req.body;

  try {
    const employee = await dbHandler.getEmployeeByName(employeeName);
    if (!employee) {
      res.status(404).send(`Employee with name ${employeeName} does not exist.`);
      return;
    } else {
      const employee_id = await getEmployeeId(employee);
      switch (action) {
        case 'create':
          return res.redirect(`/add-request?employeeId=${encodeURIComponent(employee_id)}`);
        case 'update':
          return res.redirect(`/update-request?employeeId=${encodeURIComponent(employee_id)}`);
        case 'delete':
          return res.redirect(`/delete?employeeId=${encodeURIComponent(employee_id)}`);
        default:
          return res.status(400).send('Unknown action');
      }
    }
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).send('Internal Server Error');
  }
});

export default router;