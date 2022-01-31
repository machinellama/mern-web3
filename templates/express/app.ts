import express, { Response as ExResponse, Request as ExRequest } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';

import { RegisterRoutes } from '../dist/routes';
import config from '../config';
import errorHandler from './util/errors';

const app = express();
const expressPort = process.env.PORT || config.express.port;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // To parse incoming requests with JSON payloads

RegisterRoutes(app);

// Error handling for invalid params and server errors
app.use(errorHandler);

// setup docs endpoint
app.use('/api/docs', swaggerUi.serve, async (_req: ExRequest, res: ExResponse) => {
  return res.send(swaggerUi.generateHTML(await import('../dist/swagger.json')));
});

app.listen(expressPort, () => {
  console.log(`Express server for {{package.projectName}} listening on port ${expressPort}`);
});
