import React, {useEffect, useState} from 'react'
import PostList from '../components/PostList'
import CreatePostForm from '../components/CreatePostForm'
import {db, auth} from '../firebase'
import {Card, Form, FormControl, Button, ListGroup} from 'react-bootstrap'
import MainNavbar from '../components/MainNavbar'
import firebase from 'firebase'
import PictureGrid from '../components/PictureGrid'
import TopPosts from '../components/TopPosts'
import FeedStyle from '../styles/FeedStyle.css'
import {Carousel, Jumbotron, Container} from 'react-bootstrap'
import RecommendedUsers from '../components/RecommendedUsers'

function Feed() {
    const [currUser, setCurrUser] = useState(firebase.auth().currentUser)
    const [followingList, setFollowingList] = useState([])
    const [followedPosts, setFollowedPosts] = useState([])
    const [topThree, setTopThree] = useState([])
    const [recomProfile, setRecomProfile] = useState([])
    const [userObj, setUserObj] = useState(null)
    const [userObjName, setUserObjName] = useState(null)

    useEffect(() => {
    if (currUser){
        db.collection('userData').where('displayName', '==', currUser?.displayName).limit(1).onSnapshot((snap) =>{
        snap.forEach((user) => {
            setUserObj(user.data())
        })
        })

    }}, [userObjName])

    useEffect(() => { //a change in authorization
        const unsubscribe = auth.onAuthStateChanged((authUser) => {
            if (authUser) {
                //user has logged in i.e. there is an authUser
                setCurrUser(authUser);
                setUserObjName(authUser.displayName)

            } else {
                //user has logged out i.e. no authUser present
                setCurrUser(null);
                setUserObjName(null);
            }


        })
        console.log(currUser)
        return () => {
            //perform cleanup actions
            unsubscribe();
        }
    }, []);


    useEffect(() => { //the following list
    if (userObj) {
        db.collection('userData').where('displayName', '==', currUser?.displayName).limit(1).onSnapshot
            ((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    setFollowingList(doc.data().followedUsersByDN)
                })
            })
    }}, [userObj])



    useEffect(() => { //getting the top three most liked clips
        db.collection('posts').orderBy('likes', 'desc').limit(3).onSnapshot(snapshot => {
            const currPosts = snapshot.docs;
            setTopThree(currPosts.map(doc => ({
                id: doc.id,
                post : doc.data()
            })));
        })
    }, []);


    useEffect(() => { //the list of posts by followed users
        if (userObj) {
            db.collection('posts').onSnapshot(snapshot => {
                let selected = snapshot.docs.filter((doc) =>
                    userObj?.followedUsersByDN.includes(doc.data().username)
                )
                setFollowedPosts(selected.map(doc => ({
                    id: doc.id,
                    post : doc.data()
                })));
            })
    }}, [userObj]);


    useEffect(() => {    //profiles of ppl the currUser does not follow
        if (userObj) {
            db.collection('userData').onSnapshot(snapshot => {

                let selected = snapshot.docs.filter((doc) =>
                    !(userObj?.followedUsersByDN.includes(doc.data().displayName))
                )
                selected = selected.filter((doc) =>
                    doc.data().displayName !== userObj?.displayName
                )
                selected = selected.map(doc => ({
                    id: doc.id,
                    profile : doc.data()
                }))

                // Shuffle array
                const shuffled = selected.sort(() => 0.5 - Math.random());
                // Get sub-array of first n elements after shuffled
                setRecomProfile(shuffled.slice(0, 3));
            })
    }}, [userObj]);

    function getRandomNum(arr, n) { //picks a random n values from a given array
        var result = new Array(n),
            len = arr.length,
            selectedIndex = new Array(n)
            for (var i = 0; i < n; i++) {

                var x = Math.floor(Math.random() * len);
                selectedIndex.push(x)
                result.push(arr[x])
            }
        return result;
    }

return (<div className='feed_page'>
        {currUser ? (
            <div>
                <div className='createFormFeed'>
                    <CreatePostForm username={currUser.displayName}/>
                </div>
                <div className='titleFeed'>
                    <h1 className='profile_title'>From Followed:</h1>
                </div>

                <Container textAlign='left'>

                    <div className="following_list">
                        {followedPosts.length === 0 ? (<div>Follow some users to stay updated with their content!</div>) : (
                        <div className='postList'> <PostList className='list' postList={followedPosts} search={""}/> </div>) }
                    </div>

                    <div className='rightside'>
                        <div className='topThree_list'>
                            <TopPosts postList={topThree} />
                        </div>

                        <div className='rec_users'>
                            <RecommendedUsers profileList={recomProfile} />
                        </div>
                    </div>

                </Container>

            </div>
        ) : (
        <Card className='login_check'>
            <Card.Header>
                *You need to login to view your feed.*
            </Card.Header>
        </Card>
        )}
        </div>
)
}

export default Feed;