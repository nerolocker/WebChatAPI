// СЫРОЙ API ДЛЯ WEBCHAT ОТ ULTRAKER И БЫЛ СДЕЛАН НА ОТЕБИСЬ И НА КОЛЕНКЕ
const axios = require('axios');

class TVFXFullAPI {
    constructor(baseURL = 'http://tvfx.tech') {
        this.baseURL = baseURL;
        this.user = null;
        this.cookies = [];
        this.isLoggedIn = false;
        
        this.client = axios.create({
            baseURL: this.baseURL,
            withCredentials: true,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
            }
        });
        
        this.client.interceptors.response.use(response => {
            const setCookie = response.headers['set-cookie'];
            if (setCookie) {
                const newCookies = setCookie.map(c => c.split(';')[0]);
                this.cookies = newCookies;
            }
            return response;
        });
    }
    
    async _request(action, data = {}) {
        try {
            const params = new URLSearchParams();
            params.append('action', action);
            for (const key in data) {
                params.append(key, data[key]);
            }
            
            const response = await this.client.post('/index.php', params.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Cookie': this.cookies.join('; ')
                }
            });
            
            return response.data;
            
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    async checkUsername(username) {
        return await this._request('check_username', { username });
    }
    
    async login(username, password) {
        const result = await this._request('register_login', { username, password });
        
        if (result && result.success) {
            this.user = { username };
            this.isLoggedIn = true;
        }
        
        return result;
    }
    
    async completeSetup(name) {
        if (!this.isLoggedIn) {
            return { success: false, error: 'Not logged in' };
        }
        return await this._request('complete_setup', { name });
    }
    
    async getCurrentUser() {
        return await this._request('get_current_user');
    }
    
    async getChats() {
        return await this._request('get_chats');
    }
    
    async getMessages(chatId, limit = 50) {
        return await this._request('get_messages', { 
            chat_id: chatId,
            limit: limit
        });
    }
    
    async sendMessage(chatId, content) {
        if (!this.isLoggedIn) {
            return { success: false, error: 'Not logged in' };
        }
        
        const res = await this._request('send_message', {
            chat_id: chatId,
            content: content
        });
        
        return res;
    }
    
    async getNotifications() {
        return await this._request('get_notifications');
    }
    
    async searchUsers(query) {
        return await this._request('search_users', { query });
    }
    
    async createChat(userIds, chatName = '') {
        return await this._request('create_chat', {
            user_ids: Array.isArray(userIds) ? userIds.join(',') : userIds,
            name: chatName
        });
    }
    
    async getChatInfo(chatId) {
        return await this._request('get_chat_info', { chat_id: chatId });
    }
    
    async getChatMembers(chatId) {
        return await this._request('get_chat_members', { chat_id: chatId });
    }
    
    async sendMessages(chatId, messages, delay = 2000) {
        const results = [];
        for (let i = 0; i < messages.length; i++) {
            const result = await this.sendMessage(chatId, messages[i]);
            results.push(result);
            if (i < messages.length - 1) await this.sleep(delay);
        }
        return results;
    }
    
    async monitorChat(chatId, onMessage, interval = 3000) {
        let lastMessages = [];
        let isMonitoring = true;
        
        const monitor = async () => {
            while (isMonitoring) {
                try {
                    const messages = await this.getMessages(chatId);
                    if (messages && Array.isArray(messages)) {
                        const newMessages = messages.filter(msg => 
                            !lastMessages.some(last => last.id === msg.id)
                        );
                        if (newMessages.length > 0 && onMessage) {
                            newMessages.forEach(onMessage);
                        }
                        lastMessages = messages.slice(-50);
                    }
                } catch (error) {}
                await this.sleep(interval);
            }
        };
        monitor();
        return { stop: () => { isMonitoring = false; } };
    }
    
    sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
    
    getSessionInfo() {
        return { isLoggedIn: this.isLoggedIn, user: this.user, cookies: this.cookies };
    }

    logout() {
        this.user = null;
        this.isLoggedIn = false;
        this.cookies = [];
    }
}

module.exports = TVFXFullAPI;