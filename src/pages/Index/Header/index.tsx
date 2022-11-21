import './index.less'
import React, { useState, useMemo } from 'react';
import { Modal, message, Form, Input } from 'antd';
import usePolling from '@/hooks/usePolling'
import moment from 'moment'
import { useLocation, history } from 'umi';
import classNames from 'classnames';

const Header: React.FC = () => {
    const [dateTimeStr, setDateTimeStr] = useState<string>('')
    const { pathname } = useLocation();
    const [form] = Form.useForm();
    const { validateFields, } = form;
    const [settingVisible, setSettingVisible] = useState(false);

    usePolling(() => {
        const now = moment()
        setDateTimeStr(now.format('yyyy年MMMDo dddd HH:mm:ss'))
    }, 500)

    const isIframe = useMemo(() => {
        return window.location.hash.indexOf('iframe') > -1;
    }, [window.location.hash]);

    if (isIframe) {
        return <div className="page-home-header-iframe">
            <span
                style={{ transform: 'scale(0.6)' }}
                onClick={() => {
                    const href = window.location.href.split('?')[0];
                    window.open(href, '_blank');
                }}
            >
                { //@ts-ignore
                    localStorage.getItem("serverTitle") || window?.QUALITY_CONFIG?.title || '视觉质检'
                }
            </span>
        </div>
    }
    return (
        <div className="page-home-header">
            <div className="left">
                <div className="date-time">{dateTimeStr}</div>
            </div>
            <div className="middle" onClick={() => setSettingVisible(true)}>
                <span>{
                    //@ts-ignore
                    localStorage.getItem("serverTitle") || window?.QUALITY_CONFIG?.title || '视觉质检'
                }</span>
            </div>
            <div className="right">

            </div>
            {settingVisible ? (
                <Modal
                    className="canvas-toolbar-setting-modal"
                    visible={settingVisible}
                    title="修改服务端端口地址"
                    onOk={() => {
                        validateFields()
                            .then((values) => {
                                localStorage.setItem("serverTitle", values['serverTitle']);
                                localStorage.setItem("ipUrl-real", values['ipUrl-real']);

                                window.location.reload();
                            })
                            .catch((err) => {
                                const { errorFields } = err;
                                message.error(`${errorFields[0].errors[0]} 是必填项`);
                            });
                    }}
                    onCancel={() => {
                        setSettingVisible(false);
                    }}
                    okText="确认"
                >
                    <div className="canvas-toolbar-setting-modal-body">
                        <Form
                            form={form}
                            labelCol={{ span: 8 }}
                            wrapperCol={{ span: 14 }}
                            // layout={'vertical'}
                            scrollToFirstError
                        >
                            <Form.Item
                                name="serverTitle"
                                label="项目名称"
                                // @ts-ignore
                                initialValue={localStorage.getItem("serverTitle") || window?.QUALITY_CONFIG?.title}
                                rules={[{ required: true, message: "项目名称" }]}
                            >
                                <Input placeholder={`视觉质检软件`} />
                            </Form.Item>
                            <Form.Item
                                name="ipUrl-real"
                                label="服务端地址"
                                initialValue={localStorage.getItem("ipUrl-real") || undefined}
                                rules={[{ required: true, message: "服务端地址" }]}
                            >
                                <Input placeholder="localhost:8866" />
                            </Form.Item>
                        </Form>
                    </div>
                </Modal>
            ) : null}
        </div>
    )
}

export default Header
