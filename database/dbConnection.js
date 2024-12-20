// import mongoose from "mongoose";

// export const dbConnection = () => {
//   mongoose
//     .connect(process.env.MONGO_URI, {
//       dbName: "MERN_HOSPITAL_MANAGMENT_SYSTEM",
//     })
//     .then(() => {
//       console.log("Connected to database!");
//     })
//     .catch((err) => {
//       console.log("Some error occured while connecting to database:", err);
//     });
// };
import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export const dbConnection = () => {
  // Log the URI (for debugging only; remove in production)
  console.log("Attempting to connect to MongoDB with URI:", process.env.MONGO_URI);

  mongoose
    .connect(process.env.MONGO_URI, {
      dbName: "MERN_HOSPITAL_MANAGMENT_SYSTEM",
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Connected to MongoDB successfully!");
    })
    .catch((err) => {
      console.error("Error connecting to MongoDB:", err.message);
      console.error("Full error details:", err);
    });
};
