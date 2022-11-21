/*
 * @name: answer
 * @author: answer
 * @Date: 2021-12-21 09:38:03
 * @description: answer
 */
import React, { useEffect, useState, useRef, useMemo } from "react";
import { Form, Input, message, Modal, notification, Badge, Spin } from "antd";
import * as _ from "lodash";
import { Props } from "./typing";
import styles from "./index.module.less";
import SecondTabs from "@/pages/home/components/SecondTabs";
import StatusBox from "@/pages/home/components/StatusBox";
import ScreenContent from "@/pages/home/components/ScreenContent";
import { nodeStatusColor } from "@/utils/AppUtilHelper";
import moment from "moment";
import { Switch, Route } from "react-router-dom";
import { website } from "@/consts";
import { DoubleLeftOutlined, DoubleRightOutlined } from "@ant-design/icons";

const RouterHome: React.FC<Props> = (props) => {
  const [form] = Form.useForm();
  const { validateFields, } = form;
  const [settingVisible, setSettingVisible] = useState(false);
  const socketRef = useRef<WebSocket>();
  const socketLogRef = useRef<WebSocket>();
  const socketStateRef = useRef<WebSocket>();
  const [data, setData] = useState<Array<any>>([]);
  const [historyData, setHistoryData] = useState<any>({});
  const [errorData, setErrorData] = useState<Array<any>>([]);
  const [footerData, setFooterData] = useState<any>({});
  const [ipString, setIpString] = useState(
    localStorage.getItem("ipString") || ""
  );
  const [showNum, setShowNum] = useState(
    localStorage.getItem("showNum") || "1"
  );
  const [hiddenLeft, setHiddenLeft] = useState(false);

  useEffect(() => {
    localStorage.setItem("showNum", showNum);
  }, [showNum]);
  // task-data
  let limitConnect = 1000000; // 断线重连次数
  let timeConnect = 0;
  function webSocketInit(service: string) {
    stateWebSocketInit(`${website.socket}task-state/${ipString}`);
    // let timer: any = null;
    socketRef.current = new WebSocket(service);
    socketRef.current.onopen = function () {
      console.log("data ws:open");
      // timer = setInterval(() => {
      socketRef.current && socketRef.current?.send("PING");
      // }, 500);
    };
    socketRef.current.onmessage = function (res) {
      try {
        const result = JSON.parse(res.data);
        const { uid = "", data = {}, ...rest } = result;
        if (uid) {
          const newData = (Object.entries(data || {}) || []).reduce(
            (pre: any, cen: any) => {
              return {
                uid,
                ...pre,
                // ...rest,
                [_.toLower(cen[0]?.split("@")[0])]: _.isBoolean(cen[1])
                  ? cen[1]
                    ? "RUNNING"
                    : "STOPPED"
                  : cen[1],
              };
            }, {}
          );
          // console.log("data ws:message:", newData);
          setData((prev: any) => {
            if (prev.filter((i: any) => i.uid === newData.uid).length) {
              return prev.map((item: any) => {
                if (item.uid === newData.uid) {
                  return Object.assign({}, item, newData);
                }
                return item;
              })
            }
            return prev.concat(newData)
          });
          const imgData = Object.entries(newData).filter((res: any) => {
            return _.isString(res[1]) ? res[1].indexOf("http") > -1 : false;
          });
          if (imgData[0] && imgData[0][1]) {
            setHistoryData((prev: any) => {
              return Object.assign({}, prev, {
                [`${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')} ${uid}`]: imgData[0][1]
              });
            });
          }
        }
      } catch (err) {

      }
    };
    socketRef.current.onclose = function () {
      console.log("data ws:close");
      // timer && clearInterval(timer);
      // timer = null;
      socketRef.current = undefined;
      // reconnect(service);
    };
    socketRef.current.onerror = function (err) {
      console.log("data ws:error:", err);
      reconnect(service);
    };
  }
  // 重连
  function reconnect(service: string) {
    // lockReconnect加锁，防止onclose、onerror两次重连
    // if (limitConnect > 0) {
    //   limitConnect--;
    timeConnect++;
    console.log(`第${timeConnect}次重连`);
    // 进行重连
    setTimeout(() => {
      webSocketInit(service);
    }, 10000);
    // } else {
    //   console.log("TCP连接已超时");
    // }
  }
  //task-state
  function stateWebSocketInit(service: string) {
    //获取节点状态
    socketStateRef.current = new WebSocket(service);
    socketStateRef.current.onopen = function () {
      console.log("state ws:open");
    };
    socketStateRef.current.onmessage = function (stateRes) {
      try {
        const result = JSON.parse(stateRes.data);
        setFooterData(result);
      } catch (err) {
        // console.log(err);
      }
    };
    socketStateRef.current.onclose = function () {
      console.log("state ws:close");
      socketStateRef.current = undefined;
      // reconnect(service);
    };
  }
  // task-error
  let limitLogConnect = 1000000; // 断线重连次数
  let timeLogConnect = 0;
  function logWebSocketInit(service: string) {
    socketLogRef.current = new WebSocket(service);
    socketLogRef.current.onopen = function () {
      console.log("ws error:open");
      socketLogRef.current && socketLogRef.current.send("PING");
    };
    socketLogRef.current.onmessage = function (res) {
      try {
        const result = JSON.parse(res.data);
        const currentData = {
          time: new Date().getTime(),
          ...result,
          level: _.toLower(result.level),
          message: _.isArray(result?.message)
            ? result.message.join(",")
            : result.message,
        };
        setErrorData((prev) => prev.concat(currentData));
        openNotificationWithIcon({
          type: result?.level,
          title:
            result?.level === "ERROR"
              ? "错误"
              : result?.level === "CRITICAL"
                ? "阻断挂起"
                : "告警",
          content: (
            <div>
              <p style={{ marginBottom: 8 }}>
                错误节点：{`${result?.node_name || ""}（${result?.nid || ""}）`}
              </p>
              <p style={{ marginBottom: 0 }}>
                错误信息：{currentData?.message || ""}
              </p>
            </div>
          ),
        });
      } catch (err) {
        // console.log(err);
      }
    };
    socketLogRef.current.onclose = function () {
      console.log("ws:close");
    };
    socketLogRef.current.onerror = function (err) {
      console.log("ws:error:", err);
      logReconnect(service);
    };
  }
  // 重连
  function logReconnect(service: string) {
    // if (limitLogConnect > 0) {
    //   limitLogConnect--;
    timeLogConnect++;
    console.log(`第${timeLogConnect}次重连`);
    // 进行重连
    setTimeout(() => {
      logWebSocketInit(service);
    }, 10000);
    // } else {
    //   console.log("TCP连接已超时");
    // }
  }
  useEffect(() => {
    logWebSocketInit(`${website.socket}task-error/${ipString}`);
    webSocketInit(`${website.socket}task-data/${ipString}`);
    // stateWebSocketInit(`${website.socket}task-state/${ipString}`);
  }, [ipString]);
  useEffect(() => {
    return () => {
      socketRef.current && socketRef.current.close();
      socketLogRef.current && socketLogRef.current.close();
      console.log("socket关闭");
    };
  }, []);

  return (
    <div className={styles.reportWrap}>
      <div className="box">
        <Switch>
          <Route exact path="/home" render={(routeProps) => {
            return <>
              {
                !hiddenLeft ?
                  <div className="left-box flex-box">
                    <div className="status-box">
                      <SecondTabs
                        showNum={showNum}
                        setShowNum={setShowNum}
                        ipString={ipString}
                        setIpString={setIpString}
                      />
                      <StatusBox errorData={errorData} showNum={showNum} data={data} historyData={historyData} />
                    </div>
                    <div className="left-hidden-btn flex-box" onClick={() => setHiddenLeft(true)}>
                      <DoubleLeftOutlined />
                    </div>
                  </div>
                  :
                  <div className="left-hidden-btn flex-box" onClick={() => setHiddenLeft(false)}>
                    <DoubleRightOutlined />
                  </div>
              }
              <div className="screen-body">
                <ScreenContent showNum={showNum} data={data} />
              </div>
            </>
          }} />
        </Switch>
      </div>
      <div className="content-footer">
        <div className="footer-item footer-title">
          设备状态
          <div className="footer-title-bg" />
        </div>
        {Object.entries(footerData).map((item: any, index) => {
          return (
            <div className="footer-item" key={index} style={{ color: nodeStatusColor[_.toUpper(item[1].Status)] }}>
              {`${data.filter((i: any) => i.uid === item[0])[0]?.nid ||
                item?.node_name ||
                "未知节点"
                }（${_.toUpper(item[1].Status)}）`}
            </div>
          );
        })}
      </div>
      {settingVisible ? (
        <Modal
          className="canvas-toolbar-setting-modal"
          visible={settingVisible}
          title="修改服务端端口地址"
          onOk={() => {
            validateFields()
              .then((values) => {
                const { serverTitle, ipUrl } = values;
                localStorage.setItem("serverTitle", serverTitle);
                localStorage.setItem("ipUrl", ipUrl);
                window.location.reload();
              })
              .catch((err) => {
                const { errorFields } = err;
                _.isArray(errorFields) && message.error(`${errorFields[0]?.errors[0]} 是必填项`);
              });
          }}
          onCancel={() => {
            setSettingVisible(false);
          }}
          okText="确认"
          getContainer={false}
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
                initialValue={localStorage.getItem("serverTitle") || undefined}
                rules={[{ required: true, message: "项目名称" }]}
              >
                <Input placeholder="视觉质检软件" />
              </Form.Item>
              <Form.Item
                name="ipUrl"
                label="服务端地址"
                initialValue={localStorage.getItem("ipUrl") || undefined}
                rules={[{ required: true, message: "服务端地址" }]}
              >
                <Input placeholder="localhost:8866" />
              </Form.Item>
            </Form>
          </div>
        </Modal>
      ) : null}
    </div>
  );
};

export default RouterHome;

// 告警提示框
const openNotificationWithIcon = (item: any) => {
  const { type = "", title = "", content = "" } = item;
  notification[type === "WARNING" ? "warning" : "error"]({
    message: title,
    description: content,
    // maxCount: 5, // 最大显示数, 超过限制时，最早的消息会被自动关闭
    duration: type === "CRITICAL" ? null : 5, // 自动关闭时间，null表示不关闭
  });
};
