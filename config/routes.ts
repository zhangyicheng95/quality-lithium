export default [
    {
        path: '/',
        component: './Index',
        routes: [
            {
                path: '/home',
                name: '实时结果',
                component: './home',
            },
            {
                path: '*',
                redirect: '/home',
            }
        ]
    },
    {
        path: '*',
        component: './home',
    }
];
