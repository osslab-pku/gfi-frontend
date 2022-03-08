import React, {forwardRef, useEffect, useRef, useState} from 'react';
import {useLocation} from 'react-router-dom';
import {useIsMobile, useWindowSize} from './app/windowContext';
import {useDispatch, useSelector} from 'react-redux';
import PropTypes from 'prop-types';

import {Container, Col, Row, Form, InputGroup, Button} from 'react-bootstrap';
import {gsap} from 'gsap';
import {ReloadOutlined, UpOutlined, DownOutlined} from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import background from '../assets/Tokyo-Tower-.jpg'
import gfiLogo from '../assets/gfi-logo.png'

import '../style/gfiStyle.css'
import {SearchOutlined} from '@ant-design/icons';
import {checkIsNumber, defaultFontFamily} from '../utils';

import {GFIWelcome} from './login/welcomePage';
import {GFIAlarm, GFICopyright} from './gfiComponents';
import {getRecommendedRepoInfo, getGFIByRepoName, getIssueByRepoInfo} from '../api/api';
import {createLogoutAction} from '../module/storage/reducers';

// TODO: MSKYurina
//  Pagination & Animation
//  Check login

interface RepoInfo {
    name: string,
    owner: string,
}

export const MainPage = (props) => {
    let [showLoginMsg, setShowLoginMsg] = useState(false)

    const isMobile = useIsMobile()
    const {width, height} = useWindowSize()

    const userName = useSelector(state => {
        if ('name' in state) return state.name
        return ''
    })

    const userAvatarUrl = useSelector(state => {
        if ('avatar' in state) return state.avatar
        return ''
    })
    
    let [repoInfo, setRepoInfo] = useState({
        name: '',
        owner: '',
    })
    let [issueIdList, setIssueIdList] = useState([])
    let [issueInfoList, setIssueInfoList] = useState([])

    let [alarmConfig, setAlarmConfig] = useState({
        show: false,
        msg: ''
    })
    
    const fetchRepoInfo = async () => {
        const res = await getRecommendedRepoInfo()
        if ('name' in res && 'owner' in res) {
            setRepoInfo(res)
        } else {
            setRepoInfo({
                name: '',
                owner: '',
            })
        }
    }
    
    useEffect(() => {
        getRecommendedRepoInfo()
            .then((info: RepoInfo) => {
                setRepoInfo(info)
            })
    }, [])

    useEffect(() => {
        getGFIByRepoName(repoInfo.name).then((res) => {
            if (Array.isArray(res)) {
                setIssueIdList(res)
            } else {
                setIssueIdList([])
            }
        })
    }, [repoInfo])

    useEffect(() => {
        if (Array.isArray(issueIdList)) {
            (async () => {
                let tempIssueInfoList = []
                for (let i = 0; i <= issueIdList.length; i++) {
                    const issueId = issueIdList[i]
                    if (checkIsNumber(issueId)) {
                        const id = Number(issueId)
                        const res = await getIssueByRepoInfo(repoInfo.name, repoInfo.owner, id)
                        if (res.code === 200) {
                            tempIssueInfoList.push(res.result)
                        } else if (res.code === 403) {
                            setAlarmConfig({
                                show: true,
                                msg: 'GitHub API rate limit exceeded, you may sign in using a GitHub account to continue'
                            })
                            break
                        }
                    }
                }
                setIssueInfoList(tempIssueInfoList)
            })()
        }
    }, [issueIdList])

    const GFIInfoList = (infoList: Array) => {
        return infoList.map((value) => {
            if ('number' in value && 'title' in value && 'state' in value
                && 'active_lock_reason' in value && 'body' in value && 'html_url' in value ) {
                return {
                    issueId: value.number,
                    title: value.title,
                    body: value.body,
                    isClosed: value.state === 'closed',
                    hasResolved: value.active_lock_reason === 'resolved',
                    htmlURL: value.html_url,
                }
            } else {
                return {
                    issueId: '',
                    title: '',
                    body: '',
                    isClosed: false,
                    hasResolved: false,
                }
            }
        })
    }

    const location = useLocation()
    useEffect(() => {
        if ('state' in location && location.state && location.state.justLogin === true) {
            setShowLoginMsg(true)
        }
    }, [])

    const renderLogo = () => {
        if (width > 700 || isMobile) {
            return (
                <img src={gfiLogo} alt={''} height={'32px'} width={'32px'} className={'logo'} style={{
                    opacity: '0.8',
                    marginRight: '15px',
                }} />
            )
        } else {
            return <></>
        }
    }

    const renderSearchArea = () => {
        return (
            <>
                <Row>
                    <Col style={{
                        marginTop: '30px',
                    }}>
                        <Form.Group>
                            <InputGroup style={{
                                display: 'flex',
                                alignItems: 'center',
                            }}>
                                {renderLogo()}
                                <Form.Control
                                    placeholder={'Github URL or Repo Name'}
                                    style={{
                                        minWidth: '240px',
                                        borderColor: '#ffffff',
                                        backgroundColor: 'rgba(255, 255, 255, 0.5)',
                                        borderTopLeftRadius: '17px',
                                        borderBottomLeftRadius: '17px',
                                        borderRightColor: 'rgba(255, 255, 255, 0)',
                                    }}
                                    aria-describedby={'append-icon'}
                                />
                                <Button variant={'outline-light'} style={{
                                    borderLeftColor: 'rgba(255, 255, 255, 0)',
                                    width: '40px',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    display: 'flex',
                                }}>
                                    <SearchOutlined style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        width: '24px',
                                        height: '24px',
                                    }}/>
                                </Button>
                            </InputGroup>
                        </Form.Group>
                    </Col>
                </Row>
            </>
        )
    }

    const renderMainArea = () => {
        return (
            <>
                <Row>
                    <Col>
                        {renderSearchArea()}
                    </Col>
                    {isMobile ? <></> : <Col/>}
                </Row>
                <Row>
                    <Col>
                        <Container style={{
                            marginTop: '30px',
                            display: 'flex',
                            padding: '0px',
                            marginLeft: '0px',
                            maxWidth: isMobile ? '100%' : '70%',
                        }}>
                            <InfoShowComponent
                                repoName={repoInfo.name}
                                gfiList={GFIInfoList(issueInfoList)}
                                onRefresh={fetchRepoInfo}
                            />
                        </Container>
                    </Col>
                </Row>
            </>
        )
    }

    return (
        <>
            <Container className={'singlePage'}>
                <Row style={{
                    marginBottom: alarmConfig.show? '-25px': '0',
                }}>
                    {alarmConfig.show? <GFIAlarm title={alarmConfig.msg} onClose={() => {setAlarmConfig({show: false, msg: alarmConfig.msg})}} /> : <></>}
                </Row>
                <Row>
                    <GFIWelcome
                        show={showLoginMsg}
                        userName={userName ? userName: 'visitor'}
                        userAvatarUrl={userAvatarUrl}
                        onClose={() => {
                            setShowLoginMsg(false)
                        }}
                    />
                </Row>
                {renderMainArea()}
                <Row style={{
                    color: 'white',
                    bottom: '0',
                }}>
                    <GFICopyright />
                </Row>
            </Container>
            <Container style={{
                backgroundImage: `url(${background})`,
                backgroundSize: 'cover',
                backgroundAttachment: 'fixed',
                width: width,
                maxWidth: width,
                height: height,
                position: 'fixed',
                top: '0',
                zIndex: '-1000',
            }} className={'background'} />
        </>
    )
}

const InfoShowComponent = React.forwardRef((props, ref) => {

    let expRef = useRef(null)

    const {repoName, gfiList, onRefresh} = props

    return (
        <Container style={{
            padding: '15px',
            marginLeft: '0px',
        }} className={'roundedContainer largeRadius'}>
            <Row>
                <Col>
                    <div style={{
                        height: '30px',
                        borderColor: '#ffffff',
                        border: 'solid 1px white',
                        borderRadius: '15px',
                        boxSizing: 'border-box',
                        marginRight: '20px',
                        display: 'inline-block',
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'flex-start',
                        }}>
                            <p style={{
                                paddingLeft: '12px',
                                marginTop: '1.5px',
                                marginBottom: '0px',
                                fontFamily: defaultFontFamily,
                                fontWeight: 'bold',
                                color: 'white',
                            }}> Recommended </p>
                            <Button variant={'outline-light'} onClick={() => onRefresh()} className={'transparent'} style={{
                                display: 'flex',
                                justifyContent: 'center',
                                borderRadius: '20px',
                                width: '40px',
                            }}>
                                <ReloadOutlined style={{
                                    color: 'white',
                                }} />
                            </Button>
                        </div>
                    </div>
                    <div style={{
                        fontFamily: defaultFontFamily,
                        fontSize: '32px',
                        fontWeight: 'bold',
                        color: 'white',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        display: 'flex',
                        // when using 'transparent' class, background color will show when mouse hovered
                        backgroundColor: 'rgba(255, 255, 255, 0)',
                        borderColor: 'rgba(255, 255, 255, 0)',
                    }}>
                        <u> {repoName} </u>
                    </div>
                </Col>
                {gfiList.map((info, idx) => {
                    return (
                        <Row key={`gfi-card-${idx}`}>
                            <GFIIssueDisplayCard
                                issueId={info.issueId}
                                title={info.title}
                                body={info.body}
                                isClosed={info.isClosed}
                                hasResolved={info.hasResolved}
                                htmlURL={info.htmlURL}
                            />
                        </Row>
                    )
                })}
            </Row>
        </Container>
    )
})

InfoShowComponent.propTypes = {
    repoName: PropTypes.string,
    gfiList: PropTypes.arrayOf(PropTypes.shape({
        issueId: PropTypes.number,
        title: PropTypes.string,
        body: PropTypes.string,
        isClosed: PropTypes.bool,
        hasResolved: PropTypes.bool,
        htmlURL: PropTypes.string
    })),
    onRefresh: PropTypes.func,
}

const GFIIssueDisplayCard = forwardRef(({issueId, title, body, isClosed, hasResolved, htmlURL}, ref) => {

    let detailedRef = useRef(null)
    let detailTimeline = gsap.timeline()
    let [detailOnDisplay, setDetailOnDisplay] = useState(false)
    let [detailBtn, setDetailBtn] = useState(false)

    const detailOnShow = () => {
        detailTimeline
            .pause()
            .clear()
            .to(detailedRef.current, {
                duration: 0.3,
                autoAlpha: 1,
                height: 'fit-content'
            })
            .play()
        setDetailOnDisplay(true)
        setDetailBtn(true)
    }

    const detailOffShow = () => {
        setDetailBtn(false)
        detailTimeline
            .pause()
            .clear()
            .to(detailedRef.current, {
                duration: 0.3,
                autoAlpha: 0,
                height: 0,
            })
            .to(detailedRef.current, {
                duration: 0.3,
                height: 0,
            })
            .play()
            .eventCallback('onComplete', () => {
                setDetailOnDisplay(false)
            })
    }

    const issueLabel = (title) => {
        return (
            <button onClick={() => {
                window.open(htmlURL)
            }} style={{
                border: 'none',
                backgroundColor: 'white',
                fontSize: '14px',
                padding: '3px',
                marginRight: '10px',
                marginLeft: '5px',
                borderRadius: '5px',
                color: '#707070',
                fontWeight: 'bold',
            }}>
                {title}
            </button>
        )
    }

    const displayBtn = () => {

        if (!detailBtn) {
            return (
                <>
                    <Button
                        className={'issue-card-btn on-display'}
                        variant={'outline-light'}
                        onClick={detailOnShow}
                    >
                        <DownOutlined style={{fontSize: '14px'}} />
                    </Button>
                    <div style={{
                        fontWeight: 'bold',
                        marginRight: '10px',
                    }}>
                        Show Details
                    </div>
                </>
            )
        } else {
            return (
                <>
                    <Button
                        className={'issue-card-btn on-display'}
                        variant={'outline-light'}
                        onClick={detailOffShow}
                    >
                        <UpOutlined style={{fontSize: '14px'}} />
                    </Button>
                </>
            )
        }
    }

    const details = () => {
        if (detailOnDisplay) {
            return (
                <>
                    <Row>
                        <Col style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.5)',
                            margin: '15px',
                            marginTop: '0px',
                            borderRadius: '10px',
                            padding: '10px',
                            minWidth: '50%',
                            color: '#373f49',
                        }}>
                            <ReactMarkdown
                                children={body}
                                remarkPlugins={[remarkGfm]}
                                className={'markdown'}
                            />
                        </Col>
                    </Row>
                    <Row style={{
                        paddingBottom: '10px',
                    }}>
                        <Col>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'row-reverse',
                                justifyContent: 'flex-start',
                                alignItems: 'center',
                            }}>
                                {isClosed ? <GFIIssueStatusTag type={'Closed'} /> : <GFIIssueStatusTag type={'Open'} />}
                                {hasResolved ? <GFIIssueStatusTag type={'Resolved'} /> : <></>}
                            </div>
                        </Col>
                    </Row>
                </>
            )
        } else {
            return <></>
        }
    }

    return (
        <Container style={{
            margin: '10px',
            backgroundColor: 'transparent',
            fontFamily: defaultFontFamily,
        }} className={'roundedContainer'}>
            <Row>
                <Col className={'issueCardTitle'}>
                    {issueLabel('#' + issueId)}
                    <div>
                        <ReactMarkdown
                            children={title}
                            remarkPlugins={[remarkGfm]}
                            className={'issue-title'}
                        />
                    </div>
                </Col>
            </Row>
            <div ref={detailedRef}>
                {details()}
            </div>
            <div style={{
                display: 'flex',
                flexDirection: 'row-reverse',
            }}>
                {displayBtn()}
            </div>
        </Container>
    )
})

GFIIssueDisplayCard.propTypes = {
    issueId: PropTypes.number,
    title: PropTypes.string,
    body: PropTypes.string,
    isClosed: PropTypes.string,
    hasResolved: PropTypes.bool,
    htmlURL: PropTypes.string
}

const GFIIssueStatusTag = ({type}) => {

    let status = 'open'
    if (type === 'Resolved') {
        status = 'resolved'
    } else if (type === 'Closed') {
        status = 'closed'
    }

    return (
        <>
            <div className={`status-tag ${status}`}>
                {type}
            </div>
        </>
    )
}

GFIIssueStatusTag.propTypes = {
    type: PropTypes.oneOf(['Resolved', 'Open', 'Closed'])
}
