const fs = require('fs');
const https = require('https');

const graph = `graph TD
    User([User Client]) --> |Interact / Chat / Connect Bank| React_Frontend[Vite React Application]
    
    subgraph Frontend Layer
    React_Frontend --> |Displays| Dashboard[Dashboard UI]
    React_Frontend --> |Displays| GoalsUI[Goals Tracking UI]
    React_Frontend --> |Floating AI| ChatWidget[Global Chat Widget]
    React_Frontend --> |Simulates Crisis| RiskEngine[Risk Simulator]
    end
    
    subgraph Express Backend Layer
    Dashboard --> |GET /api/insights| Insight_Controller
    GoalsUI --> |CRUD /api/goals| Goal_Controller
    ChatWidget --> |POST /api/chat| Chat_Controller
    
    Insight_Controller --> AI_Engine{aiRecommendationService}
    end
    
    subgraph MongoDB Database Layer
    AI_Engine --> |Reads Portfolio & Writes Insights| DB[(Mongoose DB)]
    Goal_Controller --> |Reads/Writes| DB
    Chat_Controller --> |Reads Portfolio| DB
    
    DB --- |Collections| Models(User, Portfolio, Insight, Goal)
    end`;

const state = {
    code: graph,
    mermaid: { theme: 'default' }
};

const data = Buffer.from(JSON.stringify(state)).toString('base64');

console.log("Downloading image from Mermiad.ink...");

https.get(`https://mermaid.ink/img/${data}`, (response) => {
    if (response.statusCode !== 200) {
        console.error("Failed with status code: " + response.statusCode);
        return;
    }
    const file = fs.createWriteStream('C:\\Users\\ASUS\\OneDrive\\Desktop\\Antigravity\\MentorAI_Architecture.png');
    response.pipe(file);
    file.on('finish', () => {
        file.close();
        console.log('Image successfully downloaded to: C:\\Users\\ASUS\\OneDrive\\Desktop\\Antigravity\\MentorAI_Architecture.png');
    });
}).on('error', (err) => {
    console.error('Error downloading image:', err);
});
