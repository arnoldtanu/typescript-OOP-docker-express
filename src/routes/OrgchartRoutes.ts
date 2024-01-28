import { Router, json } from 'express';
import OrgchartController from '../controllers/OrgchartController';

const router = Router();
const orgchartController = new OrgchartController();

router.post('/add', json(), orgchartController.addEmployee.bind(orgchartController));

export default router;
