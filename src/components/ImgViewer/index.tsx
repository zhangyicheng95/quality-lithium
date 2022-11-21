import './index.less'
import { useState, useEffect } from 'react'
import { throttle } from 'lodash'
import { Button, Divider } from 'antd'
import {
    ZoomInOutlined, ZoomOutOutlined,
    UndoOutlined, RedoOutlined,
    FullscreenOutlined, FullscreenExitOutlined,
    DoubleLeftOutlined, DoubleRightOutlined,
    SmallDashOutlined, CloseOutlined
} from '@ant-design/icons'
import moment from 'moment'

const testImgUrl = 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimage.lnstzy.cn%2Faoaodcom%2F2018-09%2F03%2F201809030926107249.jpg.w1090.h1080.jpg%3Fdown&refer=http%3A%2F%2Fimage.lnstzy.cn&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1638328435&t=78f1679e76c454f3c4b9fb7664d2a5a1'
const format = (time) => moment(time).format("YYYY-MM-DD HH:mm:ss");
const zIndex = 2000
const Mode = {
    CONTAIN: {
        name: "contain",
        icon: "full-screen",
    },
    ORIGINAL: {
        name: "original",
        icon: "scale-to-original",
    },
}
const mousewheelEventName = "mousewheel";
const LABEL_RESULT = {
    1: "正常",
    0: "未审核",
    "-1": "异常",
}
const CLASS_RESULT = {
    1: "success",
    0: "normal",
    "-1": "danger",
}

const getInitialTransform = () => ({
    scale: 1,
    deg: 0,
    offsetX: 0,
    offsetY: 0,
    enableTransition: false,
})

interface IProps{
    data: any;
    onClose?: () => void;
    onPrev?: () => void;
    onNext?: () => void;
    onAudit?: (direction: number) => void;
}

const ImgViewer: React.FC<IProps> = ({data, onClose, onPrev, onNext, onAudit}) => {
    const [loading, setLoading] = useState<boolean>(false)
    const [transform, setTransform] = useState<any>(getInitialTransform())
    const [mode, setMode] = useState<any>(Mode.CONTAIN)
    const [imgStyle, setImgStyle] = useState<any>({})

    const reset = () => setTransform(getInitialTransform())
    const handleActions = (action, options = {}) => {
        if (loading) return
        const { zoomRate, rotateDeg, enableTransition } = {
            zoomRate: 0.2,
            rotateDeg: 90,
            enableTransition: true,
            ...options,
        }
        switch (action) {
            case "zoomOut":
                if (transform.scale > 0.2) {
                    setTransform({
                        ...transform, enableTransition,
                        scale: parseFloat((transform.scale - zoomRate).toFixed(3))
                    })
                }
                break;
            case "zoomIn":
                setTransform({
                    ...transform, enableTransition,
                    scale: parseFloat((transform.scale + zoomRate).toFixed(3))
                })
                break;
            case "clocelise":
                setTransform({
                    ...transform, enableTransition,
                    deg: transform.deg + rotateDeg
                })
                break;
            case "anticlocelise":
                setTransform({
                    ...transform, enableTransition,
                    deg: transform.deg - rotateDeg
                })
                break;
        }
    }
    const prev = () => {
        onPrev()
        reset()
    }
    const next = () => {
        onNext()
        reset()
    }
    const toggleMode = () => {
        if (loading) return
        const modeNames = Object.keys(Mode)
        const modeValues = Object.values(Mode)
        const index = modeValues.indexOf(mode)
        const nextIndex = (index + 1) % modeNames.length
        setMode(Mode[modeNames[nextIndex]])
        reset()
    }
    const _keyDownHandler = throttle((e) => {
        const keyCode = e.keyCode;
        switch (keyCode) {
            // ESC
            case 27:
                // onClose()
                break
                // SPACE
            case 32:
                toggleMode()
                break
                // LEFT_ARROW
            case 37:
                prev()
                break
                // UP_ARROW
            case 38:
                handleActions("zoomIn")
                break
                // RIGHT_ARROW
            case 39:
                next()
                break
                // DOWN_ARROW
            case 40:
                handleActions("zoomOut")
                break
        }
    })
    const _mouseWheelHandler = throttle((e) => {
        const delta = e.wheelDelta ? e.wheelDelta : -e.detail;
        if (delta > 0) {
            handleActions("zoomIn", {
                zoomRate: 0.015,
                enableTransition: false,
            })
        } else {
            handleActions("zoomOut", {
                zoomRate: 0.015,
                enableTransition: false,
            })
        }
    }, 20)

    const handleImgLoad = () => {
        setLoading(false)
    }
    const handleImgError = (e) => {
        setLoading(false)
        e.target.alt = "加载失败"
    }
    const handleMouseDown = (e) => {
        if (loading || e.button !== 0) return
        const { offsetX, offsetY } = transform
        const startX = e.pageX
        const startY = e.pageY
        const _dragHandler = throttle((ev) => {
            setTransform({
                ...transform,
                offsetX: offsetX + ev.pageX - startX,
                offsetY: offsetY + ev.pageY - startY
            })
        })
        document.addEventListener("mousemove", _dragHandler)
        document.addEventListener("mouseup", () => {
            document.removeEventListener("mousemove", _dragHandler)
        })
        e.preventDefault()
    }

    useEffect(() => {
        document.addEventListener("keydown", _keyDownHandler)
        document.addEventListener(mousewheelEventName, _mouseWheelHandler)
        return () => {
            document.removeEventListener("keydown", _keyDownHandler)
            document.removeEventListener(mousewheelEventName, _mouseWheelHandler)
        }
    }, [transform])

    useEffect(() => {
        const { scale, deg, offsetX, offsetY, enableTransition } = transform;
        let style = {
            transform: `scale(${scale}) rotate(${deg}deg)`,
            transition: enableTransition ? "transform .3s" : "",
            "marginLeft": `${offsetX}px`,
            "marginTop": `${offsetY}px`,
        };
        if (mode.name === Mode.CONTAIN.name) {
            Object.assign(style, {
                maxWidth: '100%',
                maxHeight: '100%'
            })
        }
        setImgStyle(style)
    }, [transform, mode])
    return (
        <div className="img-viewer__wrapper" style={{zIndex}}>
            <div className="img-viewer__mask">
                <SmallDashOutlined />
            </div>
            <span className="img-viewer__close" onClick={onClose}>
                <CloseOutlined />
            </span>
            {!!onPrev && <span
                className="img-viewer__direction img-viewer__prev"
                onClick={prev}
            >
                <DoubleLeftOutlined />
            </span>}
            {!!onNext && <span
                className="img-viewer__direction img-viewer__next"
                onClick={next}
            >
                <DoubleRightOutlined />
            </span>}
            <div className="img-viewer__actions">
                <div className="img-viewer__actions__inner">
                    <ZoomOutOutlined onClick={() => handleActions('zoomOut')}/>
                    <ZoomInOutlined onClick={() => handleActions('zoomIn')}/>
                    <Divider type="vertical"/>
                    {mode.icon === 'full-screen'
                        ? <FullscreenOutlined onClick={toggleMode}/>
                        : <FullscreenExitOutlined onClick={toggleMode}/>
                    }
                    <Divider type="vertical"/>
                    <UndoOutlined onClick={() => handleActions('anticlocelise')}/>
                    <RedoOutlined onClick={() => handleActions('clocelise')}/>
                </div>
            </div>

            <div className="img-viewer__canvas">
                {data.imageUrl && <img
                    className="img-viewer__img"
                    src={data.imageUrl}
                    style={imgStyle}
                    onLoad={handleImgLoad}
                    onError={handleImgError}
                    onMouseDown={handleMouseDown}
                />}
            </div>

            <div className="img-viewer__info">
                <div className="field">
                    <div className="title">订单号</div>
                    <div className="value">{data.orderId}</div>
                </div>
                <div className="field">
                    <div className="title">图片序号</div>
                    <div className="value">{data.id}</div>
                </div>
                <div className="field">
                    <div className="title">时间</div>
                    <div className="value">{format(data.time)}</div>
                </div>
                <div className="field">
                    <div className="title">检测结果</div>
                    <div className={CLASS_RESULT[data.result]}>
                        {LABEL_RESULT[data.result]}
                    </div>
                </div>
                {!!onAudit && (
                    <div className="field">
                        <div className="title">审核结果</div>
                        {!!data.isAudited
                            ? <div className={CLASS_RESULT[data.isAudited]}>
                                {LABEL_RESULT[data.isAudited]}
                            </div>
                            : <div>
                                <Button className="type-success" onClick={() => onAudit(1)}>正常</Button>
                                <Button danger onClick={() => onAudit(-1)}>异常</Button>
                            </div>
                        }
                    </div>
                )}
            </div>
        </div>
    )
}

export default ImgViewer
