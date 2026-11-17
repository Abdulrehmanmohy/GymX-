import serverless from "serverless-http";
import { createApiApp } from "../../src/server/createApp.ts";

const app = createApiApp();

export const handler = serverless(app);
