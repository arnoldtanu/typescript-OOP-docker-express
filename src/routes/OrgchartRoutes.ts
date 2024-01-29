import { Router, json } from 'express';
import OrgchartController from '../controllers/OrgchartController';

const router = Router();
const orgchartController = new OrgchartController();

router.post('/add', json(), (req, res) => orgchartController.addEmployees(req, res));
router.get('/find/:name', json(), (req, res) => orgchartController.findEmployees(req, res));
router.post('/update', json(), (req, res) => orgchartController.updateEmployee(req, res));
router.post('/delete', json(), (req, res) => orgchartController.deleteEmployee(req, res));
router.get('/export', json(), (req, res) => orgchartController.exportChart(req, res));
router.get('/reset', json(), (req, res) => orgchartController.resetChart(req, res));

export default router;
