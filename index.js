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

app.get("ping", (req, res) => {
    res.send("테스트")
})

// GPT API
app.post("/message", (req, res) => {
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
        try{

            const chatCompletion = await openai.chat.completions.create({
                model: "gpt-4-0314", //gpt-3.5-turbo
                messages: [{"role": "user", "content": message,}],
                max_tokens:1000
            });


            const responseArray = chatCompletion.choices[0].message.content
            .split("\n")
            .map(line => line.replace(/^\d+\.\s*/, '').trim()) // Remove numbers and trim
            .filter(line => line);
        
          res.status(200).send(responseArray)

        }catch(error){
            console.log(error);
            res.status(500).send(error)
        }

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

// Place 관련 서비스 로직
const sortAndFilterPlaces = (places) => {
    // 반경으로 필터링 예시
    const filteredByRadius = places.filter(place => place.radius <= someRadiusValue);
  
    // 리뷰 수로 정렬
    const sortedByReviews = filteredByRadius.sort((a, b) => b.reviewCount - a.reviewCount);
  
    // 가나다순으로 정렬
    const sortedAlphabetically = sortedByReviews.sort((a, b) => a.name.localeCompare(b.name));
  
    return sortedAlphabetically;
  };
  
  // Place 라우트
  app.post('/places', async (req, res) => {
    console.log("req : ", req.body[3]);
    // try {
    //   const { places } = req.query;
    //   const sortedPlace = sortAndFilterPlaces(places);
    //   res.status(200).json(sortedPlace);
    // } catch (error) {
    //   console.error('Error in place processing:', error);
    //   res.status(500).send('Error processing your request');
    // }
});

app.post('/search-places', async (req, res) => {
    const { standard, radius, type, places } = req.body;
    console.log({places})

    try {
        let filteredPlaces = filterByRadius(places, standard, radius);
        console.log({filteredPlaces})
        filteredPlaces = filterByType(filteredPlaces, type);
        console.log({filteredPlaces})
        res.json(filteredPlaces);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

function filterByRadius(places, standard, radius) {
    const distanceAddedPlaces = places.map(place =>{ 
        const distance = getDistanceFromLatLonInKm(
            standard.y, standard.x, // 기준 좌표 (위도, 경도)
            parseFloat(place.y), parseFloat(place.x) // 장소의 좌표 (위도, 경도)
          )
          console.log({
            1:standard.y,
            2:standard.x,
            3:parseFloat(place.y),
            4:parseFloat(place.x),
            distance
          })

        return({
      ...place,
      distance
    })});
  
    if (radius === "가까운 순") {
      // "가까운 순"으로 정렬
      return distanceAddedPlaces.sort((a, b) => a.distance - b.distance);
    } else if (radius === "500m") {
      // 500m 이내의 장소 필터링
      return distanceAddedPlaces.filter(place => place.distance <= 0.5);
    } else if (radius === "1km") {
      // 1km 이내의 장소 필터링
      return distanceAddedPlaces.filter(place => place.distance <= 1);
    }
    return [];
}
  
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // 지구의 반지름(km)
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // 거리(km)
}
  
function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

function filterByType(places, type) {
    const indoorTypes = ["아쿠아리움", "박물관", "식물원", "전망대", "전시관", "인라인스케이트", "만화카페"];
    const themeTypes = ["농장", "동굴", "테마파크", "탑", "성곽", "유원지", "문화유적", "숲"];
  
    return places.filter(place => {
      const category = place.category_name;
      if (type === "실내") {
        return indoorTypes.some(indoorType => category.includes(indoorType));
      } else if (type === "테마") {
        return themeTypes.some(themeType => category.includes(themeType));
      }
      return false;
    });
}




const port = process.env.PORT || 8001;

app.listen(port, () => {
    console.log(`${port}`);
})


