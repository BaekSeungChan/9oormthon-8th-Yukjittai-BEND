const express = require("express");
const bodyParser = require("body-parser");
const OpenAI  = require('openai');
const cors = require('cors');
const axios = require('axios');

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

// GPT API
app.post("/message", (req, res) => {
    console.log('req', req);
    console.log("req.body", req.body);
    const keyword = req.body.keyword
    const condition1 = req.body.condition1
    const condition2 = req.body.condition2
    const message = `당신은 제주도 관광업체의 전문가입니다. 당신은 관광 활동의 추천을 담당하고 있습니다.
    나는 지금 ${keyword} 나는 ${condition1} 활동과 ${condition2} 활동이 하고 싶습니다. 아래의 조건 사항을 지켜 추천해주십시오.
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

// 카카오 다중목적지 길찾기 API 라우트
app.post('/kakao/directions', async (req, res) => {
    try {
      const kakaoResponse = await axios.post('https://apis-navi.kakaomobility.com/v1/destinations/directions', req.body, {
        headers: {
          Authorization: `KakaoAK ${process.env.KAKAO_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      res.json(kakaoResponse.data);
    } catch (error) {
      console.error('Error calling Kakao Directions API:', error);
      res.status(500).send('Error processing your request');
    }
  });

const port = process.env.PORT || 8001;

app.listen(port, () => {
    console.log(`${port}`);
})