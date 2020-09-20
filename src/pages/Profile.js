import React, {useEffect, useState} from 'react'
import ProfileCard from '../components/ProfileCard'
import ProfileCardv2 from '../components/ProfileCardv2'
import {db, auth} from '../firebase'
import {Container, Card} from 'semantic-ui-react'
import { Nav, Button, Form, FormControl} from 'react-bootstrap'
import ProfileStyle from '../styles/Profile.css'
import ProfileList from '../components/ProfileList'
import PostList from '../components/PostList'

import firebase from 'firebase'

function Profile(props) {
    const [currUser, setCurrUser] = useState(firebase.auth().currentUser);
    const [profileList, setProfileList] = useState([]);
    const [userPosts, setUserPosts] = useState([]);

    //for dynamic url searching
    const [queryUsername, setQueryUsername] = useState(null)
    const [queryUserObj, setQueryUserObj] = useState(null)


    //getting the user doc from the username
   useEffect(() => {
        db.collection('userData').where('displayName', '==', queryUsername).limit(1).onSnapshot(snap => {
            snap.forEach((doc) => {
                setQueryUserObj(doc)
            })
        })

   }, [queryUsername])

    useEffect(() => {
        db.collection('userData').onSnapshot(snapshot => {
            const currProfiles = snapshot.docs;
            setProfileList(currProfiles.map(doc => ({
                id: doc.id,
                profile : doc.data()
            })));
        })
    }, []);


    useEffect(() => { //a change in authorization
        const unsubscribe = auth.onAuthStateChanged((authUser) => {
            if (authUser) {
                //user has logged in i.e. there is an authUser
                console.log(authUser);
                setCurrUser(authUser);
                if (!props.match.params.username) {
                    setQueryUsername(authUser.displayName)
                } else {
                    setQueryUsername(props.match.params.username)
                }

            } else {
                //user has logged out i.e. no authUser present
                setCurrUser(null);
            }
        })
        return () => {
            //perform cleanup actions
            unsubscribe();
        }
    }, []);


    useEffect(() => { //the list for posts published by the currUser
        if (queryUserObj) {
            db.collection('posts').onSnapshot(snapshot => {
                let UsersPosts = snapshot.docs.filter((doc) =>
                    doc.data().authorId === queryUserObj?.data().userID
                )
                setUserPosts(UsersPosts.map(doc => ({
                    id: doc.id,
                    post : doc.data()
                })));
            })
    }}, [queryUserObj]);

    var test = currUser?.displayName
        console.log(queryUserObj)
    return <div className='prof_page'>
            {currUser?.displayName ? (
                <div >
                <div className='title'>
                    <h1 className='profile_title'>{queryUsername}&apos;s Profile:</h1>
                </div>

                <Container textAlign='left' className='profile_content'>
                    <div className='profile_card'>

                        <br/>
                        <br/>
                        <ProfileCardv2  username={queryUsername} owner={queryUserObj?.data().userID} />
                    </div>


                    <div className='your_postList' >
                        <br/>
                        <br/>
                         {userPosts.length === 0 ? (<h3 className='null_clips'>No published clips!</h3>) : (
                         <PostList  postList={userPosts} search={""}/> )}
                    </div>

                    <div className='social_search'>
                        <br/>
                          <Card fluid>
                              <Card.Content>
                                <Card.Header>
                                 <h2 className='connect_tag'> Connect with others: </h2>
                                 </Card.Header>
                              </Card.Content>
                              <Card.Content fluid>
                                  <div className='prof_search'>
                                    <br/>
                                    <div cassName='prof_results'>
                                    <ProfileList profileList = {profileList} search = {""} loggedIn={test}/>
                                    </div>
                                    </div>
                              </Card.Content>
                          </Card>
                     </div>
                </Container>
                 </div>




                 ) :
             (<Card fluid className='login_check'>
                <Card.Header>
                    *You need to login to view your profile.*
                </Card.Header>
              </Card>)}
            </div>


}

export default Profile;