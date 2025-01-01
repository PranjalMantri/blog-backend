import mongoose from "mongoose";

const database_connection_string = process.env.DATABASE_CONNECTION_STRING;
async function connectDB() {
  await mongoose
    .connect(database_connection_string)
    .then(() =>
      console.log("Sucessfully established a connection to the database")
    )
    .catch((error) => {
      console.log(
        "Something went wrong while connecting to the database",
        error.message
      );

      process.exit(1);
    });
}

export default connectDB;
