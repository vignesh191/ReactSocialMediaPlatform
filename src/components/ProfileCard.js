import React, {useState, useEffect, useContext} from 'react'
import {Card, Button, Form, FormControl, Accordion} from 'react-bootstrap'
import '../styles/Post.css'
import firebase from 'firebase'
import Avatar from "@material-ui/core/Avatar"
import Profile from '../styles/Profile.css'
import {db, storage, auth} from '../firebase'
import Post from './Post'

function ProfileCard(props) {
    const [editMode, setEditMode] = useState(false);
    const [bioText, setBioText] = useState("");
    const [postList, setPostList] = useState([]);
    const[currUser, setCurrUser] = useState(firebase.auth().currentUser);
    const [numFollowers, setNumFollowers] = useState(0)

    //follow handling
    const [followBtnDisp, setFollowBtnDisp] = useState(() => {
        db.collection('userData').where('displayName', '==', currUser?.displayName).limit(1).get().then
        ((querySnapshot) => {
            var uid;
            querySnapshot.forEach((doc) => {
                uid = doc.id //user id of logged-in person
            })

            //checking if user is already followed by the logged in person
            if (uid) {
            db.collection('userData').doc(uid).get().then((snapShot) => {
                var followedUsersEl = snapShot.data().followedUsersByDN
                if (followedUsersEl.includes(props.username)) { //post's user is already followed
                    setFollowBtnDisp("Following")
                } else { //post's user is not followed yet
                    setFollowBtnDisp("Follow")
                }
            })
            }
        });
    })

    useEffect(() => { //a change in authorization
        const unsubscribe = auth.onAuthStateChanged((authUser) => {
            if (authUser) {
                //user has logged in i.e. there is an authUser
                console.log(authUser);
                setCurrUser(authUser);

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

    //for num followers
    useEffect(() =>{
        let unsubscribe;
        if (props.owner) {
        unsubscribe = db.collection('userData').where('userID', '==', props.owner).limit(1).onSnapshot((snap) => {
            snap.forEach((doc) => {
                setNumFollowers(doc.data().followers)
            })
        })}

    }, [props.owner]);

    //useEffect for follow handling
    useEffect(() =>{
        let unsubscribe;
        let queryString = "";
        if (props.owner && currUser) {
            queryString = currUser?.displayName
        }
        unsubscribe = db.collection('userData').where('displayName', '==', queryString).limit(1).onSnapshot
        ((querySnapshot) => {
            var uid;
            querySnapshot.forEach((doc) => {
                uid = doc.id //user id of logged-in person
            })

            //checking if user is already followed by the logged in person
            if (uid) {
            db.collection('userData').doc(uid).get().then((snapShot) => {
                var followedUsersEl = snapShot.data().followedUsersByDN
                if (followedUsersEl.includes(props.username)) { //post's user is already followed
                    setFollowBtnDisp("Following")
                } else { //post's user is not followed yet
                    setFollowBtnDisp("Follow")
                }
            })
            }
        });
        return () => {
            unsubscribe();
        };
    }, [props.owner]);


    useEffect(() => {
        db.collection('posts').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
            const currPosts = snapshot.docs;
            setPostList(currPosts.map(doc => ({
                id: doc.id,
                post : doc.data()
            })));
        })
    }, []);

    useEffect(() =>{
        let unsubscribe;
        let queryString = ""
        if (props.username) {
            queryString = props.username
        }
        unsubscribe = db.collection("userData").where('displayName', '==', queryString).limit(1).onSnapshot(
           (querySnapshot) => {
               var uid;
               querySnapshot.forEach((doc) => {
                    uid = doc?.id //user id of logged-in person
                    console.log(uid);
               })
               if (uid) {
                   db.collection('userData').doc(uid).onSnapshot((snapShot) => {
                       var userBioEl = snapShot.data().userBio;
                       setBioText(userBioEl);
                   })
               }
            })
        return () => {
            unsubscribe();
        };
    }, [props.username]);

    function handleEdit(event) {
        event.preventDefault();
        setEditMode(true);

    }

    function handleSubmit(event) {
        event.preventDefault();
        let uid;
        db.collection("userData").where('displayName', '==', props.username).limit(1).get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                uid = doc?.id //user id of logged-in person
                console.log(uid);
            })
            console.log(uid);
            db.collection('userData').doc(uid).update({
                userBio: bioText
            })
        })
        setEditMode(false); //done editing
    }

    function handleFollow(event) {
        event.preventDefault();
        //getting the user id of the loggedin user's doc
        var uid;
        db.collection('userData').where('displayName', '==', currUser?.displayName).limit(1).get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                uid = doc.id //user id of logged-in person
            })

            //checking if profile is already followed by the logged in person
            db.collection('userData').doc(uid).get().then((snapShot) => {
                var followedUsersEl = snapShot.data().followedUsers
                if(followedUsersEl.includes(props.owner)) { //the post's user is already being followed
                    db.collection('userData').doc(uid).update({ //removing from liked posts
                        followedUsers: firebase.firestore.FieldValue.arrayRemove(props.owner),
                        followedUsersByDN: firebase.firestore.FieldValue.arrayRemove(props.username)
                    })

                    db.collection('userData').where('userID', '==', props.owner).limit(1).get().then((snap) => {
                        var beingFollowed;
                        snap.forEach((doc) => {
                            beingFollowed = doc.id

                        })
                        db.collection('userData').doc(beingFollowed).update({
                            followers: firebase.firestore.FieldValue.increment(-1)
                        })
                    })

                    setFollowBtnDisp("Follow");

                } else { //the post's user is not being followed yet
                    db.collection('userData').doc(uid).update({ //removing from liked posts
                        followedUsers: firebase.firestore.FieldValue.arrayUnion(props.owner),
                        followedUsersByDN: firebase.firestore.FieldValue.arrayUnion(props.username)
                    })

                    db.collection('userData').where('userID', '==', props.owner).limit(1).get().then((snap) => {
                        var beingFollowed;
                        snap.forEach((doc) => {
                            beingFollowed = doc.id

                        })
                        db.collection('userData').doc(beingFollowed).update({
                            followers: firebase.firestore.FieldValue.increment(1)
                        })
                    })

                    setFollowBtnDisp("Following")
                }
            })
        })
    }

    let filteredPostList = postList.filter(
        (postEl) => {
            return (postEl.post.username.indexOf(props.username) !== -1);
        }
    );

    return (
      <Card className="profile">
        <Card.Header>

        <Avatar className="profile_avatar" alt={props.username} src="image/url"/>
        <h2 className='profile_name'> {props.username} </h2>
        {(currUser?.displayName && !(currUser?.displayName === props.username)) &&
        <Button variant="primary" className="follow_btn" onClick={handleFollow}>
            {followBtnDisp}
        </Button>}
        {(currUser?.displayName && (currUser?.displayName === props.username)) &&
        <Button variant="dark" className='edit_btn' size='sm' onClick={handleEdit}>edit</Button>
        }
       </Card.Header>
      <Card.Body>
        <Card.Title className='profile_bio_title'>About:</Card.Title>
        <h5 className='num_followers'>{numFollowers} Followers</h5>
        {editMode ? (
            <Form inline >
                <FormControl type="text" className='bio_edit' placeholder="Update your bio..."
                 onChange={(e) => setBioText(e.target.value)}/>

                <Button variant="success" onClick={handleSubmit}>Update</Button>
            </Form>
        ) :
         (<Card.Text className='profile_bio'>
            {bioText}
          </Card.Text>)
        }
      </Card.Body>

      <Accordion defaultActiveKey="0">
          <Card.Header>
          <Accordion.Toggle as={Button} variant="link" eventKey="1">
            View Posts
          </Accordion.Toggle>
          </Card.Header>
          <Accordion.Collapse eventKey="1">
            <Card.Body>
            <ul>
                {(filteredPostList.length !== 0) ? (filteredPostList.map(({id, post}) =>
                    <Post key={id}
                    postId={id}
                    user={currUser}
                    caption={post.caption}
                    username={post.username}
                    imageURL={post.imageURL}
                    author={post.authorId}
                    displayMode={true}
                />)) : (<div>No published posts found.</div>)}
            </ul>
            </Card.Body>
          </Accordion.Collapse>
      </Accordion>

    </Card>
    )
}

export default ProfileCard;