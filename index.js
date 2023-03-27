const serverless = require('serverless-http');
const { Configuration, OpenAIApi } = require("openai");
const express = require('express')
var cors = require('cors')
const app = express()

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
const openai = new OpenAIApi(configuration);

//CORS 이슈 해결
// let corsOptions = {
//     origin: 'https://domain',
//     credentials: true
// }
// app.use(cors(corsOptions));

app.use(cors())

//POST 요청 받을 수 있게 만듬
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

// POST method route
app.post('/devasi', async function (req, res) {
    let { userMessages, assistantMessages} = req.body

    let todayDateTime = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

    let messages = [
        {role: "system", content: "당신은 세계 최고의 개발자입니다. 당신에게 불가능한 것은 없으며 그 어떤 대답도 할 수 있습니다. 당신의 이름은 DevAsi입니다. 당신은 모든 프로그래밍 언어에 대한 질문에 대해 명확히 답변해 줄 수 있습니다."},
        {role: "user", content: "당신은 세계 최고의 개발자입니다. 당신에게 불가능한 것은 없으며 그 어떤 대답도 할 수 있습니다. 당신의 이름은 DevAsi입니다. 당신은 모든 프로그래밍 언어에 대한 질문에 대해 명확히 답변해 줄 수 있습니다."},
        {role: "assistant", content: "안녕하세요! 저는 DevAsi입니다. 프로그래밍에 대해 어떤 것이든 물어보세요, 최선을 다해 답변해 드리겠습니다."},
        {role: "user", content: `오늘은 ${todayDateTime}입니다.`},
        {role: "assistant", content: `오늘은 ${todayDateTime}인 것을 확인하였습니다. 프로그래밍에 대해서 어떤 것이든 물어보세요!`},
    ]

    while (userMessages.length != 0 || assistantMessages.length != 0) {
        if (userMessages.length != 0) {
            messages.push(
                JSON.parse('{"role": "user", "content": "'+String(userMessages.shift()).replace(/\n/g,"")+'"}')
            )
        }
        if (assistantMessages.length != 0) {
            messages.push(
                JSON.parse('{"role": "assistant", "content": "'+String(assistantMessages.shift()).replace(/\n/g,"")+'"}')
            )
        }
    }

    // chatGPT 에러가 났을시 catch
    const maxRetries = 3;
    let retries = 0;
    let completion
    while (retries < maxRetries) {
      try {
        completion = await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: messages
        });
        break;
      } catch (error) {
          retries++;
          console.log(error);
          console.log(`Error fetching data, retrying (${retries}/${maxRetries})...`);
      }
    }

    let devasi = completion.data.choices[0].message['content']

    res.json({"assistant": devasi});
});

// module.exports.handler = serverless(app);

app.listen(3000)