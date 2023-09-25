const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost:27017/data")
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch(() => {
    console.log("Failed to connect to MongoDB");
  });

const LoginSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
});

const collection = mongoose.model("collection1", LoginSchema);

module.exports = collection;


