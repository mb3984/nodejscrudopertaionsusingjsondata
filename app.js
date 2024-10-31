const express = require("express");
const app = express();
const short = require("short-uuid");
const fs = require("fs");

// Read and parse the JSON file
const jsonData = fs.readFileSync("./data.json", "utf-8");
const data = JSON.parse(jsonData);

app.use(express.json());

// Get data route
app.get("/data", async (req, res) => {
  try {
    if (data.length === 0) {
      throw new Error("No data in the JSON file");
    }
    res.status(200).send({
      status: "Success",
      message: data,
    });
    console.log(data);
  } catch (error) {
    res.status(404).send({
      status: "Failure",
      message: error.message,
    });
  }
});

app.post("/post/data", async (req, res) => {
  try {
    const { name, age } = req.body;
    const id = short.generate();

    // Check if user already exists based on the name field
    const userExists = data.some((user) => user.name === name);

    if (userExists) {
      // If user exists, send an error response
      return res.status(400).send({
        status: "error",
        message: "User already exists",
      });
    }

    // Create the new user object with id, name, and age
    const userDetails = { id, name, age };

    // Add the new user to the data array
    data.push(userDetails);

    // Write the updated `data` array back to `data.json`
    const userStore = JSON.stringify(data, null, 2); // formatted for readability
    fs.writeFileSync("./data.json", userStore);

    res.status(200).send({
      status: "success",
      message: userDetails,
    });
    console.log("User added succesfully");
    console.log(userDetails);
  } catch (error) {
    res.status(500).send({
      status: "error",
      message: "An error occurred while adding the user",
    });
    console.error(error);
  }
});

// PATCH request to update user details by userId with try-catch error handling
app.patch("/data/:userId", (req, res) => {
  try {
    const userId = req.params.userId;
    const updateDetails = req.body;

    // Find the user by id
    const userIndex = data.findIndex((user) => user.id == userId);

    if (userIndex === -1) {
      // If user not found, throw an error
      throw new Error("User not found");
    }

    // Update only the fields provided in the request
    data[userIndex] = { ...data[userIndex], ...updateDetails };

    // Save updated data to data.json
    fs.writeFileSync("./data.json", JSON.stringify(data, null, 2));

    // Send success response with updated user data
    res.status(200).send({
      status: "success",
      message: "User updated successfully",
      data: data[userIndex],
    });
    console.log("User updated succesfully");
    console.log(updateDetails);
  } catch (error) {
    // Handle errors and send appropriate response
    res.status(500).send({
      status: "error",
      message: error.message,
    });
  }
});

// GET request to fetch user by userId
app.get("/data/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    // Check if userId is numeric, search data by integer IDs
    const user = isNaN(userId)
      ? data.find((user) => user.id === userId) // Alphanumeric search
      : data.find((user) => user.id == userId); // Numeric search

    if (!user) {
      // If user is not found, send a 404 response
      return res.status(404).send({
        status: "error",
        message: "User not found",
      });
    }

    // If user is found, send the user details
    res.status(200).send({
      status: "success",
      message: user,
    });
    console.log(user);
  } catch (error) {
    res.status(500).send({
      status: "error",
      message: "An error occurred while fetching the user",
    });
    console.error(error);
  }
});

app.listen(3009, () => {
  console.log("Server is running at http://localhost:3009");
});
