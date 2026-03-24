import app from "./app";
import { env } from "./config/env";
import "./queue/queue"; 

const PORT = Number(process.env.PORT || env.PORT || 8080);

app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});