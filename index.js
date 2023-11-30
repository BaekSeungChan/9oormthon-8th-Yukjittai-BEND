const express = require("express");
const bodyParser = require("body-parser");
const OpenAI  = require('openai');

require("dotenv").config();

const app = express();
app.use(bodyParser.json());


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req, res) => {
    res.send("dkdkdk")
})

app.post("/message", (req, res) => {
    const message = req.body.message;

    const openFun = async() => {
    const chatCompletion = await openai.chat.completions.create({
        model: "gpt-4-0314", //gpt-3.5-turbo
        messages: [{"role": "user", "content": message,}],
        max_tokens:1000
  });
  console.log(chatCompletion.choices[0].message.content);
  res.send(chatCompletion.choices[0].message.content); 
    }   
    openFun();   
});

const port = process.env.PORT || 8001;

app.listen(port, () => {
    console.log(`${port}`);
})