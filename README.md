# WebChatAPI
<p align="center">
API для webchat который был сделан студий TVFX 
(ВНИМАНИЕ API СЫРОЙ) Сделал CactusTeam
</p>

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Axios](https://img.shields.io/badge/axios-671ddf?style=for-the-badge&logo=axios&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)


Библеотека
npm install axios

```nodejs
const TVFXFullAPI = require('./apiwebchat.js');

(async () => {
    const api = new TVFXFullAPI();
    
    // Авторизация
    const auth = await api.login('USERNAME', 'PASSWORD');
    
    if (!auth.success) {
        console.error('Auth failed:', auth.error);
        return;
    }

    console.log('Logged in successfully');

    // Получение списка чатов
    const chats = await api.getChats();
    
    if (Array.isArray(chats)) {
        console.log('Available Chats:');
        chats.forEach(chat => {
            console.log(`- ${chat.name || 'Private Chat'} (ID: ${chat.id})`);
        });
    }
})();
```
