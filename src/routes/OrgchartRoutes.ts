import { Router, json } from 'express';
import OrgchartController from '../controllers/OrgchartController';

const router = Router();
const orgchartController = new OrgchartController();

router.post('/add', json(), (req, res) => orgchartController.addEmployees(req, res));
router.get('/find/:id', json(), (req, res) => orgchartController.findEmployees(req, res));
router.post('/update', json(), (req, res) => orgchartController.updateEmployee(req, res));
router.post('/delete', json(), (req, res) => orgchartController.deleteEmployee(req, res));

export default router;
