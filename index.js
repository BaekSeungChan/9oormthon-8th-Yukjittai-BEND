const express = require("express");
const bodyParser = require("body-parser");
const OpenAI  = require('openai');
const cors = require('cors');

require("dotenv").config();
const app = express();

app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req, res) => {
    res.send("dkdkdk")
})

app.post("/message", (req, res) => {
    const aaa = req.body.message;
    const bbb = req.body.bbb
    const ccc = req.body.ccc
    const ddd = req.body.ddd
    const message = `당신은 제주도 관광업체의 전문가입니다. 당신은 관광 활동의 추천을 담당하고 있습니다.
    나는 지금 ${bbb} 나는 ${ccc} 활동과 ${ddd} 활동이 하고 싶습니다. 아래의 조건 사항을 지켜 추천해주십시오.
    1. 정확한 활동명으로 추천해주세요
    2. 제안된 활동명은 1어절 단위의 1개의 단어로 표현해주십시오.
    3. 활동명은 2개만 추천해주십시오. 그 외의 추천은 필요 없습니다.
    `
    

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