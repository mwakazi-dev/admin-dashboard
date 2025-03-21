import mongoose from "mongoose";

// connect mongoose to the mongodb database
const connectToDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);

    console.log("MongoDB connected...");
  } catch (error) {
    console.error("Error connecting to MongoDB:", (error as Error).message);
    process.exit(1);
  }
};

export default connectToDB;
