import dotenv from "dotenv";


dotenv.config({ path: ".env.local" });

import app from "./app";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
