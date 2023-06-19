import request from '@/utils/request'
import {User} from "@/types";

export const successApi = () => {
    return request<User>({
        url: '/success',
        method: 'get'
    })
};

export const failApi = () => {
    return request<User>({
        url: '/fail',
        method: 'get'
    })
};
