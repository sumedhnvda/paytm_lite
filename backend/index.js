const express = require("express");
const cors = require("cors");
const app=express();
app.use(express.json())
app.use(cors());
const urlroute=require("./routes/index")
const port=3000;
app.use("/api/v1",urlroute)  
  app.listen(port, () => {
    console.log(`port ${port}`)
  })