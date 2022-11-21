import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./index.module.less";
import { Col, Form, Modal, Row, Table } from "antd";
import { guid } from "@/utils/AppUtilHelper";
import moment from "moment";
import { url } from "../../api";
import PanelTitle from "@/components/PanelTitle";
import _ from "lodash";
import TooltipDiv from "@/components/TooltipDiv";

const StatusBox: React.FC<any> = (props: any) => {
  const { errorData, showNum, data = [], historyData = {} } = props;
  const [form] = Form.useForm();
  const [selected, setSelected] = useState(2);
  const [rightList, setRightList] = useState<Array<any>>([]);
  const [historyImg, setHistoryImg] = useState('');
  const [historyImgTitle, setHistoryImgTitle] = useState('');
  const columns = [
    {
      title: "报警时间",
      dataIndex: "time",
      key: "time",
      render: (text: any) => {
        return moment(text).format("YYYY-MM-DD HH:mm:ss");
      },
    },
    {
      title: "报警类型",
      dataIndex: "level",
      key: "level",
      render: (text: any) => {
        return <div className="flex-box">
          <span className={`level-icon ${text}`} />
          <span style={text === 'error' ? { color: '#e50012' } : {}}>{text}</span>
        </div>;
      },
    },
    {
      title: "位置",
      dataIndex: "position",
      key: "position",
      render: (text: any, record: any) => {
        return `${record?.node_name || ""}（${record?.nid || ""}）`;
      },
    },
    {
      title: "内容",
      dataIndex: "message",
      key: "message",
    },
  ];
  useEffect(() => {
    setRightList(errorData);
  }, [errorData]);

  const list = useMemo(() => {
    return Object.entries(historyData);
  }, [historyData])

  return (
    <div className={styles.statusBox}>
      <div className="left-info">
        <PanelTitle>基础信息</PanelTitle>
        <div className="info-box">
          {
            data.slice(0, showNum).map((item: any, index: number) => {
              const { product_id, result } = item;
              return (
                <Col span={12} key={index} style={{ padding: '0 48px' }}>
                  <span style={{
                    fontWeight: "bold",
                    color: result === 'NG' ? 'rgb(230,0,22)' : 'rgb(33,213,15)'
                  }}>
                    {product_id}
                  </span>
                </Col>
              )
            })
          }
        </div>
      </div>
      <div className="right-info">
        {/* <div className="title">异常显示</div> */}
        <div className="info-tab">
          {[
            // { title: "报警信息", key: 1 },
            { title: "最近NG", key: 2 },
          ].map((item: any, index: number) => {
            return (
              <div
                className={`info-tab-item ${selected === item.key ? "selected" : ""
                  }`}
                key={item.key}
                onClick={() => setSelected(item.key)}
              >
                {item.title}
              </div>
            );
          })}
        </div>
        <div className="info-table">
          <Table
            columns={columns}
            scroll={{ y: 115 }}
            dataSource={rightList}
            pagination={false}
            rowKey={(record) => guid()}
          />
        </div>
      </div>
      <div className="left-info bottom-info">
        <div className="info-box">
          {
            list.slice(list.length - 101).map((item: any, index: number) => {
              return (
                <TooltipDiv
                  key={item[0]}
                  title={item[0]}
                  style={{
                    textDecoration: 'underline',
                  }}
                  onClick={() => {
                    setHistoryImg(item[1]);
                    setHistoryImgTitle(item[0]);
                  }}
                >{item[0]}</TooltipDiv>
              );
            })
          }
        </div>
      </div>

      <Modal
        title={historyImgTitle}
        width="calc(100vw - 48px)"
        wrapClassName="history-img-modal"
        centered
        visible={!!historyImg}
        maskClosable={false}
        footer={false}
        onCancel={() => {
          setHistoryImg('');
          setHistoryImgTitle('');
        }}
      >
        <img src={historyImg} alt="" />
      </Modal>
    </div>
  );
};

export default StatusBox;
