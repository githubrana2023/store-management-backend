import { serve } from "@hono/node-server";
import app from "./app.js";



const bootstrap = async () => {
    try {
        console.log("Starting application...");

        // await seedDatabase();

        serve({
            fetch: app.fetch,
            port: Number(
                process.env.PORT ?? 3000,
            ),
        });

        console.log(
            `Server running on port ${process.env.PORT ?? 3000
            }`,
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