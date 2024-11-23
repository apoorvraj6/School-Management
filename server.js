const express = require("express");
const dotenv = require("dotenv");
const connection = require("./db"); 

const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());


app.post("/addSchool", (req, res) => {
  const { name, address, latitude, longitude } = req.body;

  if (!name || !address || !latitude || !longitude) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (typeof name !== "string") {
    return res.status(400).json({ message: "Name should be a String" });
  }

  if (typeof address !== "string") {
    return res.status(400).json({ message: "Address should be a String" });
  }

  if (typeof latitude !== "number") {
    return res.status(400).json({ message: "latitude should be a Number" });
  }
  if (typeof longitude !== "number") {
    return res.status(400).json({ message: "longitude should be a number" });
  }
  

  const query =
    "INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)";
  connection.query(
    query,
    [name, address, latitude, longitude],
    (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error inserting school", error: err, });
      }
      res
        .status(201)
        .json({ message: "School added successfully", id: result.insertId });
    }
  );
});


app.get("/listSchools", (req, res) => {
  const { user_lat, user_lon } = req.query;

  if (!user_lat || !user_lon) {
    return res
      .status(400)
      .json({ message: "User latitude and longitude are required" });
  }


  const query =
    "SELECT *, ( 6371 * acos( cos( radians(?) ) * cos( radians( latitude ) ) * cos( radians( longitude ) - radians(?) ) + sin( radians(?) ) * sin( radians( latitude ) ) ) ) AS distance FROM schools ORDER BY distance ASC";
  connection.query(query, [user_lat, user_lon, user_lat], (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error fetching schools", error: err });
    }
    res.status(200).json(results);
  });
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
