// 채팅 메시지를 표시할 DOM
const chatMessages = document.querySelector('#chat-messages');
// 사용자 입력 필드
const userInput = document.querySelector('#user-input input');
// 전송 버튼
const sendButton = document.querySelector('#user-input button');
// 발급받은 OpenAI API 키를 변수로 저장
const apiKey = '//';
// OpenAI API 엔드포인트 주소를 변수로 저장
const apiEndpoint = 'https://api.openai.com/v1/chat/completions'



// 새로운 div 생성
function addMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    
    // sender와 message를 구분하여 추가
    const senderElement = document.createElement('span');
    senderElement.textContent = `${sender}: `;
    messageElement.appendChild(senderElement);
    
    // 한 문장씩 나누어서 줄 바꿈 적용
    const sentences = message.split('. '); // 마침표와 뒤에 공백을 기준으로 문장 나누기
    sentences.forEach(sentence => {
        const sentenceElement = document.createElement('p');
        sentenceElement.textContent = sentence.trim(); // 양쪽 공백 제거
        messageElement.appendChild(sentenceElement);
    });

    chatMessages.prepend(messageElement);
}



// 날씨 정보를 수신하고 GPT 프롬프트를 생성하여 응답 받기
window.addEventListener('message', async (event) => {
    if (event.data.type === 'weather') {
        const weather = event.data.data;
        const prompt = `
        오늘 날씨는 ${weather.weather}이고, 
        최고/최저 온도는 ${weather.temp_max}°C / ${weather.temp_min}°C이며 
        습도는 ${weather.humidity}%, 풍속은 ${weather.wind_speed} m/s,
        체감 온도는 ${weather.feels_like}°C입니다.\n

        해당 날씨에 알맞은 복장을 추천해주면 되는데 
        답변할 때는 위에 나열한 날씨 데이터들을 반복해서 출력해주세요.\n

        비, 안개, 강풍과 같이 기상상태가 안좋다면 주의가 필요한 레저활동에 대해 경고해주세요.\n
        농업/어업 역시 마찬가지입니다.\n
        
        위 요구사항들은 모두 ${weather.weather},  ${weather.wind_speed}의 날씨 데이터에 맞게끔 출력해야합니다.
        무조건 모든 문장은 문장이 끝날때마다 줄바꿈을 통해 가독성을 높여주세요`;
        const aiResponse = await fetchAIResponse(prompt);
        addMessage('🌞날씨알리미🌞', `도시: ${weather.city}\n${aiResponse}`);
    }
});

// ChatGPT API 요청
async function fetchAIResponse(prompt) {
    // API 요청에 사용할 옵션을 정의
    const requestOptions = {
        method: 'POST',
        // API 요청의 헤더를 설정
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",  // 사용할 AI 모델
            messages: [{
                role: "user", // 메시지 역할을 user로 설정
                content: prompt // 사용자가 입력한 메시지
            },],
            temperature: 0.8, // 모델의 출력 다양성
            max_tokens: 1024, // 응답받을 메시지 최대 토큰(단어) 수 설정
            top_p: 1, // 토큰 샘플링 확률을 설정
            frequency_penalty: 0.5, // 일반적으로 나오지 않는 단어를 억제하는 정도
            presence_penalty: 0.5, // 동일한 단어나 구문이 반복되는 것을 억제하는 정도
            stop: ["Human"], // 생성된 텍스트에서 종료 구문을 설정
        }),
    };
    // API 요청후 응답 처리
    try {
        const response = await fetch(apiEndpoint, requestOptions);
        const data = await response.json();
        const aiResponse = data.choices[0].message.content;
        return aiResponse;
    } catch (error) {
        console.error('OpenAI API 호출 중 오류 발생:', error);
        return 'OpenAI API 호출 중 오류 발생';
    }
}


// 전송 버튼 클릭 이벤트 처리
sendButton.addEventListener('click', async () => {
    // 사용자가 입력한 메시지
    const message = userInput.value.trim();
    // 메시지가 비어있으면 리턴
    if (message.length === 0) return;
    // 사용자 메시지 화면에 추가
    addMessage('나', message);
    userInput.value = '';
    //ChatGPT API 요청후 답변을 화면에 추가
    const aiResponse = await fetchAIResponse(message);
    addMessage('🌞날씨알리미🌞', aiResponse);
});

// 사용자 입력 필드에서 Enter 키 이벤트를 처리
userInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        sendButton.click();
    }
});


// DOM 로드가 완료되었을 때 기본 메시지 추가
document.addEventListener('DOMContentLoaded', () => {
    addMessage('🌞날씨알리미🌞', '안녕하세요! 저는 날씨알리미 챗봇입니다. 날씨에 따른 알맞은 복장, 레저활동,농업, 해양 정보를 제시합니다 :)');
});
