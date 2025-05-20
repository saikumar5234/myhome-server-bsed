import axios from 'axios';

const instance = axios.create({
baseURL: 'https://spring-dep-doc-1.onrender.com/customers', // replace with your backend URL or IP if needed
timeout: 5000,
headers: {
'Content-Type': 'application/json',
},
});

export default instance;
