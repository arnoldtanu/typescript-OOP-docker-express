import express from 'express';
import orgchartRoutes from './routes/OrgchartRoutes';

const app = express();

app.use(express.json());
app.use('/v1', orgchartRoutes);

export default app;
