import { Router } from 'express';
import { sessionRouter } from './session.routes.js';
import { messageRouter } from './message.routes.js';

export const routes = Router();

routes.use('/sessions', sessionRouter);
routes.use('/messages', messageRouter);
