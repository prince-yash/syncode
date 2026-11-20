import { app } from "./app.js";
import { environment } from "./env.js";
import { logger } from "./logger.js";

const host = environment.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1";

const server = app.listen(environment.PORT, host, () => {
  logger.info({ host, port: environment.PORT }, "API server listening");
});

server.on("error", (error: NodeJS.ErrnoException) => {
  logger.error({ code: error.code }, "API server failed to start");
  process.exitCode = 1;
});
