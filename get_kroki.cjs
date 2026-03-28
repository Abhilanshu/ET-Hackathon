const fs = require('fs');
const https = require('https');
const zlib = require('zlib');

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

const deflated = zlib.deflateSync(Buffer.from(graph, 'utf8'));
const base64 = deflated.toString('base64').split('+').join('-').split('/').join('_');

const url = 'https://kroki.io/mermaid/png/' + base64;

console.log("Fetching from Kroki...");
https.get(url, (response) => {
    if (response.statusCode !== 200) {
        console.error("Failed with status: " + response.statusCode);
        return;
    }
    const filePath = 'C:\\\\Users\\\\ASUS\\\\OneDrive\\\\Desktop\\\\Antigravity\\\\MentorAI_Architecture.png';
    const file = fs.createWriteStream(filePath);
    response.pipe(file);
    file.on('finish', () => {
        file.close();
        console.log('Success! Saved to ' + filePath);
    });
}).on('error', (err) => {
    console.error("Error: ", err);
});
