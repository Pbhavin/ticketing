import axios from 'axios';

const buildClient = ({ req }) => {
    if (typeof window === 'undefined') {
        // We are on Server
        return axios.create({
            baseURL:
                'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
            headers: req.headers,
        });
    } else {
        // we are on browser
        return axios.create({});
    }
};

export default buildClient;
