import React, {useEffect, useState} from 'react';
import {Alert, Badge, Col, Container, ListGroup, Row} from 'react-bootstrap';
import '../../style/gfiStyle.css'

import {checkIsNumber} from '../../utils';
import {GFISearchBar, GFICopyright} from '../gfiComponents';
import {RepoGraphContainer} from './repoDataDemonstrator';

import {getRepoNum, getRepoInfo} from '../../api/api';
import {GFIPagination} from '../gfiComponents';
import Fade from 'react-reveal/Fade'

/*
    TODO: @MSKYurina
          More project information & plots
          Cache
 */

export const Repositories = (props) => {

    const repoListCapacity = 5

    let [pageIdx, setPageIdx] = useState(1)

    let [totalRepos, setTotalRepos] = useState(0)
    useEffect(() => {
        getRepoNum().then((num) => {
            if (num && Number.isInteger(num)) {
                setTotalRepos(num)
            } else {
                setTotalRepos(0)
            }
        })
    })

    let [infoList, setInfoList] = useState([])
    useEffect(() => {
        let beginIdx = (pageIdx - 1) * repoListCapacity
        getRepoInfo(beginIdx, repoListCapacity).then((repoList) => {
            if (repoList && Array.isArray(repoList)) {
                setInfoList(repoList)
            } else {
                setInfoList([])
            }
        }).then(() => {
            setActiveCardIdx(0)
        })
    }, [pageIdx])

    let [activeCardIdx, setActiveCardIdx] = useState(0)
    let [pageFormInput, setPageFormInput] = useState(0)

    const projectCardOnClick = (idx) => {
        setActiveCardIdx(idx)
    }

    const projectsInfos = (info, index) => {
        return (
            <RepoInfoCard
                key={'infoCard' + index}
                initInfo={info}
                index={index}
                nowactive={activeCardIdx}
                callback={projectCardOnClick}
            />
        )
    }

    const renderProjectsInfos = (infoArray) => {
        if (infoArray && Array.isArray(infoArray)) {
            return (infoArray.map((info, idx) => {
                return projectsInfos(JSON.parse(info), idx)
            }))
        }
    }

    const pageNums = () => {
        if (totalRepos % repoListCapacity === 0) {
            return Math.floor(totalRepos / repoListCapacity)
        } else {
            return Math.floor(totalRepos / repoListCapacity) + 1
        }
    }

    const toPage = (i) => {
        if (1 <= i && i <= pageNums()) {
            setPageIdx(i)
        }
    }

    const onFormInput = (target) => {
        setPageFormInput(target.value)
    }

    const onPageBtnClicked = () => {
        if (checkIsNumber(pageFormInput)) {
            pageFormInput = Number(pageFormInput)
            if (pageFormInput > 0 && pageFormInput <= pageNums()) {
                toPage(pageFormInput)
            } else {
                window.alert('Out of page index, max page number is ' + pageNums())
            }
        } else {
            window.alert('Please input a number')
        }
    }
    
    // a little trick
    let [showCards, setShowCards] = useState(false)
    let [cardInfoList, setCardInfoList] = useState([])
    let [cardInfoListToDisplay, setCardInfoListToDisplay] = useState([])

    useEffect(() => {
        if (infoList.length && activeCardIdx < infoList.length) {
            setShowCards(false)
            let parsedInfoList = JSON.parse(infoList[activeCardIdx])
            if (parsedInfoList) {
                setCardInfoList(parsedInfoList)
            } else {
                setCardInfoList([])
            }
        } else {
            setCardInfoList([])
        }
    }, [activeCardIdx, infoList])

    useEffect(() => {
        setTimeout(() => {
            setShowCards(true)
            setCardInfoListToDisplay(cardInfoList)
        }, 200)
    }, [cardInfoList])

    return (
        <Container className={'singlePage'}>
            <Row>
                <GFISearchBar description={'Search for your project'} title={'search'} />
            </Row>
            <Row>
                <Col sm={4} style={{
                    minWidth: '330px',
                }}>
                    <Row>
                        <Col>
                            <Alert variant={'success'}>
                                <Alert.Heading> Data from {totalRepos} different GitHub repositories </Alert.Heading>
                            </Alert>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <ListGroup style={{
                                marginBottom: '10px',
                            }}>
                                {renderProjectsInfos(infoList)}
                            </ListGroup>
                        </Col>
                    </Row>
                    <Row>
                        <GFIPagination
                            pageIdx={pageIdx}
                            toPage={(pageNum) => toPage(pageNum)}
                            pageNums={pageNums()}
                            onFormInput={(target) => onFormInput(target)}
                            onPageBtnClicked={() => onPageBtnClicked()}
                            maxPagingCount={3}
                        />
                    </Row>
                </Col>
                <Col sm={8}>
                    <Fade top delay={0} distance={'7%'} when={showCards} force={true}>
                        <RepoGraphContainer
                            info={'monthly_stars' in cardInfoListToDisplay ? cardInfoListToDisplay.monthly_stars: []}
                            title={'Stars By Month'}
                        />
                    </Fade>
                    <Fade top delay={100} distance={'7%'} when={showCards} force={true}>
                        <RepoGraphContainer
                            info={'monthly_issues' in cardInfoListToDisplay ? cardInfoListToDisplay.monthly_issues: []}
                            title={'Issues By Month'}
                        />
                    </Fade>
                    <Fade top delay={200} distance={'7%'} when={showCards} force={true}>
                        <RepoGraphContainer
                            info={'monthly_commits' in cardInfoListToDisplay ? cardInfoListToDisplay.monthly_commits: []}
                            title={'Commits By Month'}
                        />
                    </Fade>
                </Col>
            </Row>
            <Row>
                <GFICopyright />
            </Row>
        </Container>
    )
}

const RepoInfoCard = (props) => {
    let [isActive, setIsActive] = useState(false)
    const [idx] = useState(props.index)

    const repoCardOnClick = () => {
        props.callback(idx)
    }

    useEffect(() => {
        setIsActive(props.nowactive === idx)
    }, [props.nowactive, idx])

    const getStars = (monthly_stars: Array) => {
        let counter = 0
        monthly_stars.forEach((value => {
            if (value.count && checkIsNumber(value.count)) {
                counter += Number(value.count)
            }
        }))
        return counter
    }

    return (
        <ListGroup.Item action as={'button'} onClick={() => repoCardOnClick()} variant={isActive ? 'primary': 'light'}>
            <Row>
                <Col style={{fontWeight: 'bold', textDecoration: isActive? 'underline': 'none'}} sm={9}> {props.initInfo.name} </Col>
                <Col sm={3}>
                    <Badge pill style={{position: 'absolute', right: '5px', top: '5px'}}> Stars: {getStars(props.initInfo.monthly_stars)} </Badge>
                </Col>
            </Row>
            <Row>
                <Col sm={9}> Language: {props.initInfo.language} </Col>
            </Row>
            <Row>
                <Col sm={9}> Owner: {props.initInfo.owner} </Col>
            </Row>
        </ListGroup.Item>
    )
}
