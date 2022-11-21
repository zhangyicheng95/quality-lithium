import React, { useEffect, useLayoutEffect, useState } from "react";
import styles from "./index.module.less";
import { Select } from "antd";
import { isString, } from "lodash";
import _ from "lodash";
import ImageDom from "./ImageDom";

const { Option } = Select;
const ScreenContent: React.FC<any> = (props: any) => {
  const { showNum, data = [], } = props;
  const [contentList, setContentList] = useState<any>([]);

  useLayoutEffect(() => {
    setContentList(data.slice(0, showNum).sort((a, b) => a.index - b.index));
  }, [data, showNum]);

  return (
    <div className={styles.screenContent}>
      <div className="screen-content-body">
        {(contentList || []).map(
          (item: any, index: number) => {
            return (
              <ContentItem
                contentList={contentList}
                item={item}
                index={index}
                showNum={showNum}
                key={item.uid}
              />
            );
          }
        )}
      </div>
    </div>
  );
};

export default ScreenContent;

const resultType: any = {
  "1": "面尺寸",
  "2": "面错位",
  "3": "面缺陷",
  "": null,
};

const ContentItem = (props: any) => {
  const { contentList, item, index, showNum } = props;
  const [showPic, setShowPic] = useState("");
  const [ifShow, setIfShow] = useState(false);
  const [imgSize, setImgSize] = useState(1);
  const { type } = item;
  const title = item.nid; //item.title + resultType[type] || "";
  const imgList = Object.entries(item).filter((res: any) => {
    return isString(res[1]) ? res[1].indexOf("http") > -1 : false;
  });
  useEffect(() => {
    if (_.isArray(imgList) && !_.isUndefined(imgList[0])) {
      setShowPic(imgList[0][0]);
      const img = new Image();
      img.src = item[imgList[0][0]];
      img.onload = (res: any) => {
        const { width = 1, height = 1 } = img;
        setImgSize(width / height);
      };
    }
  }, [imgList]);


  return (
    <div
      key={item.uid}
      className="body-item"
      style={Object.assign(
        (index + 1) === contentList.length || index % 2 === 1
          ? { borderRight: 0 }
          : {},
        (index + 1) === contentList.length ? { borderBottom: 0 } : {},
        contentList.length <= 2 ? { height: '100%' } : {},
        contentList.length <= 4 ? { minWidth: '50%' } : { minWidth: '33.3%' },
      )}
      onMouseOver={() => setIfShow(true)}
      onMouseLeave={() => setIfShow(false)}
    >
      <div className="pic-title-select">
        {(imgList.length > 1 && ifShow) ? (
          <Select
            size="small"
            style={{ width: "100%" }}
            onChange={(value: any) => {
              setShowPic(value);
            }}
            defaultValue={(_.isArray(imgList) && !_.isUndefined(imgList[0])) ? imgList[0][0] : undefined}
          >
            {(imgList || []).map((picItem: any, picIndex: number) => {
              return (
                <Option key={picItem[0]} value={picItem[0]}>
                  展示{picItem[0]}图
                </Option>
              );
            })}
          </Select>
        ) : null}
      </div>
      <div className="pic-title">{title}</div>
      <div className="pic-box">
        <ImageDom
          src={item[showPic]}
          alt="图片"
          style={imgSize < 1 ? { height: '100%', width: 'auto' } : { width: '100%', height: 'auto' }}
        />
      </div>
      {/* <div className="pic-title">{`${title}趋势图`}</div> */}
      {/* <div className="chart-box">
        {type === "3" ? (
          <Charts option={barChartDefectOption(item.chartData)} />
        ) : (
          <Charts option={lineChartDefectOption(item.chartData)} />
        )}
      </div> */}
    </div>
  );
};
