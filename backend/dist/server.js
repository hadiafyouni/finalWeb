"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const PORT = parseInt(process.env.PORT ?? '4000');
const app = (0, app_1.buildApp)();
app.listen({ port: PORT, host: '0.0.0.0' }, (err, addr) => {
    if (err) {
        app.log.error(err);
        process.exit(1);
    }
    app.log.info(`🎓 Student Management API → ${addr}`);
});
process.on('SIGINT', async () => { await app.close(); process.exit(0); });
process.on('SIGTERM', async () => { await app.close(); process.exit(0); });
//# sourceMappingURL=server.js.map