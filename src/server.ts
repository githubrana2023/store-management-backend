import { serve } from "@hono/node-server";
import app from "./app.js";
import { config } from "./config/evn.js";
import { seedDatabase } from "./drizzle/seed-platform-admin.js";



const bootstrap = async () => {
    try {
        console.log("Starting application...");

        await seedDatabase();

        serve({
            fetch: app.fetch,
            port: config.port,
        });

        console.log(
            `Server running on port ${config.port}`,
        );
    } catch (error) {
        console.error(
            "Failed to start application:",
            error,
        );

        process.exit(1);
    }
}

bootstrap()