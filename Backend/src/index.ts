import express from "express";
import mainRoute from "./routes";
import cors from "cors";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use("/api/v1", mainRoute);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
