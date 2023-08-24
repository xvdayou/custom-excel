const fs = require("fs");
const express = require("express");
const app = express();
const port = 8888;

app.get("/", (req, res) => {
  res.send("Hello World!");

  fs.readFile(
    "C:\\Users\\ex02701\\Desktop\\结构二室项目控制表.xlsx",
    (err, data) => {
      if (err) throw err;
      console.log("data", data);
    }
  );
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
