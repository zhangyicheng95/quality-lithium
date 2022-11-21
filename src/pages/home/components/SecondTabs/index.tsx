import React, { useState } from "react";
import styles from "./index.module.less";
import { Button, Input, Select, Upload } from "antd";

const { Option } = Select;

const SecondTabs: React.FC<any> = (props: any) => {
  const { showNum, setShowNum, ipString, setIpString } = props;
  const [edit, setEdit] = useState(false);

  return (
    <div className={styles.secondTabs}>
      <Input
        style={{ width: 200, marginRight: 8 }}
        placeholder="项目ID"
        defaultValue={ipString}
        disabled={!edit}
        onChange={(e) => {
          const { value } = e.target;
          setIpString(value);
        }}
      />
      {edit ? (
        <Button
          type="primary"
          className="item-btn"
          onClick={() => {
            localStorage.setItem("ipString", ipString);
            setEdit(false);
          }}
        >
          确定
        </Button>
      ) : (
        <Button
          type="primary"
          className="item-btn"
          onClick={() => {
            setEdit(true);
          }}
        >
          修改项目ID
        </Button>
      )}
      <Select
        placeholder="显示结果个数"
        style={{ width: 160 }}
        onChange={(value) => {
          setShowNum(value);
        }}
        defaultValue={showNum}
      >
        {showNumList.map((item) => {
          return (
            <Option key={item.num} value={item.num}>
              {item.title}
            </Option>
          );
        })}
      </Select>
    </div>
  );
};

export default SecondTabs;

const showNumList = [
  {
    title: "显示全部",
    num: "100",
  },
  {
    title: "显示一个区",
    num: "1",
  },
  {
    title: "显示二个区",
    num: "2",
  },
  {
    title: "显示四个区",
    num: "4",
  },
];
