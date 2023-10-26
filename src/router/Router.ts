import {createRouter, createWebHashHistory, RouteRecordRaw} from 'vue-router';
import Home from '../views/Home.vue';

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        redirect: '/deviceList',
    },
    {
        path: '/',
        name: 'Home',
        component: Home,
        children: [
            {
                path: '/deviceList',
                name: 'deviceList',
                meta: {
                    title: '设备列表',
                },
                component: () => import('../views/DeviceList.vue'),
            },
            {
                path: '/taskList',
                name: 'taskList',
                meta: {
                    title: '回捞任务',
                },
                component: () => import('../views/TaskList.vue'),
            },
            {
                path: '/logList',
                name: 'logList',
                meta: {
                    title: '日志列表',
                },
                component: () => import('../views/LogList.vue'),
            }
        ],
    },
    {
        path: '/login',
        name: 'Login',
        meta: {
            title: '登录',
        },
        component: () => import( '../views/Login.vue'),
    },
    {
        path: '/apps',
        name: 'Apps',
        meta: {
            title: '应用列表',
        },
        component: () => import('../views/Apps.vue'),
    },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    document.title = `${to.meta.title} | ZLogAdmin`;
    next();
});

export default router;
