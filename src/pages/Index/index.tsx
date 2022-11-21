import React, { useEffect } from 'react';
import 'antd/dist/antd.less';
import '../../global.less';
import Header from './Header'

interface IProps {
    children: React.ReactNode;
}

const Index: React.FC<IProps> = ({
    children,
}) => {
    useEffect(() => {
        !localStorage.getItem("serverTitle") && localStorage.setItem("serverTitle", '视觉质检软件');
        !localStorage.getItem("ipUrl-real") && localStorage.setItem("ipUrl-real", 'localhost:8866');
    }, []);

    return (
        <div id="app">
            <Header />
            <div className="content">
                {children}
            </div>
        </div>
    );
};

export default Index;
