import app from "./app.js";
import connectDB from "./db/db.js";
import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT || 8001;

connectDB()
  .then(() => {
    app.on("error", (error) => {
      throw error;
    });

    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.log(
      "Something went wrong while connecting to the database",
      error.message
    );
  });
