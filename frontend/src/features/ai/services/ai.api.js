import axios from 'axios';

const getAiBaseUrl = () => {
    const envUrl = (import.meta.env.VITE_API_URL || '').trim();
    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && envUrl.startsWith('http://')) {
        return '/ai';
    }
    if (!envUrl || envUrl === '/api') {
        return '/ai';
    }
    return `${envUrl.replace(/\/+$/, '')}/ai`;
};

const api = axios.create({
    baseURL: getAiBaseUrl(),
    withCredentials: true
});

export async function generateInterviewReport({ resume, resumeFile, selfDescription, jobDescription }) {
    try {
        let payload;
        let config = {};

        if (resumeFile) {
            payload = new FormData();
            if (resume) payload.append('resume', resume);
            if (selfDescription) payload.append('selfDescription', selfDescription);
            if (jobDescription) payload.append('jobDescription', jobDescription);
            payload.append('resumeFile', resumeFile);
            config.headers = { 'Content-Type': 'multipart/form-data' };
        } else {
            payload = { resume, selfDescription, jobDescription };
        }

        const response = await api.post('/generate', payload, config);
        return response.data;
    } catch (error) {
        console.error("AI Generation Error", error);
        throw error;
    }
}
