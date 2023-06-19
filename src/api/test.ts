import {User} from "@/types";
import request from "@/utils/request";

export const successApi = () => {
    return request<User>({
        url: '/success',
        method: 'get'
    })
}

export const failApi = () => {
    return request<User>({
        url: '/fail',
        method: 'get'
    })
}
