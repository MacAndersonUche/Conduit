/**
 *  WARNING: DO NOT RESTART THE SERVER !! 
 * 
 * This application uses in-memory storage (arrays) for data persistence.
 * Restarting the server will LOSE ALL DATA.
 * 
 * Keep the server running to preserve your data!
 */

import express from "express";
import routes from "./routes";

const app = express();
const PORT = 5000;

app.use(express.json());
app.use("/", routes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
