import React, {useState, useEffect, useContext} from 'react'
import { Card, Icon, Image, Form, Button, Input } from 'semantic-ui-react'
import { FormControl, Accordion} from 'react-bootstrap'

import firebase from 'firebase'
import Avatar from "@material-ui/core/Avatar"
import Profile from '../styles/Profile.css'
import {db, storage, auth} from '../firebase'
import Post from './Post'

function ProfileCardv2(props) {

    const DEFAULT_PROF_PIC = 'https://firebasestorage.googleapis.com/v0/b/react-gaming-sm.appspot.com/o/profiles%2FdefaultProfPic.png?alt=media&token=d265d4ae-2252-4c26-98d8-e879122014bf'
    const [editMode, setEditMode] = useState(false);
    const [bioText, setBioText] = useState("");
    const [profPic, setProfPic] = useState('')

    const [postList, setPostList] = useState([]);
    const[currUser, setCurrUser] = useState(firebase.auth().currentUser);
    const [numFollowers, setNumFollowers] = useState(0)

    const [fileSelect, setFileSelected] = useState(0)

    //follow button color handling
    const [followActive, setFollowActive] = useState(() => {
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
                    setFollowActive(true)
                } else { //post's user is not followed yet
                    setFollowActive(false)
                }
            })
            }
        });
    })
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
                    setFollowActive(true)
                } else { //post's user is not followed yet
                    setFollowBtnDisp("Follow")
                    setFollowActive(false)
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

    useEffect(() =>{ //bio editing use effect
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

    useEffect(() => {
        setProfPic(profPic)
    }, [profPic])

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
                       var profPicEl = snapShot.data().ProfilePic;
                       if (profPicEl !== '') {
                        setProfPic(profPicEl);
                       } else {
                        setProfPic(DEFAULT_PROF_PIC)
                       }
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

        //e.preventDefault()
        //let uid;
        if (fileSelect === 1) {
        const fileName = profPic.name;
        console.log(fileName)
        const uploadTask = storage.ref().child('profiles/' + fileName).put(profPic);

        uploadTask.on(
            "state_changed",
            (snapshot) => {

            },
            (error) => {
                console.log(error); //if there was an upload error
                alert(error.message);
            },
            () => { //when completed uploading
                storage
                    .ref('profiles')
                    .child(profPic.name)
                    .getDownloadURL() //get download link
                    .then(url => {
                        //put image and details in db
                        console.log(url);

                    db.collection("userData").where('displayName', '==', props.username).limit(1).get()
                    .then((querySnapshot) => {
                        querySnapshot.forEach((doc) => {
                            uid = doc?.id //user id of logged-in person
                            console.log(uid);
                        })
                        console.log(uid);
                        db.collection('userData').doc(uid).update({
                            ProfilePic: url
                        })
                    })
                    });
            }
        );
        setFileSelected(0)
        }

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
      <Card max-width='5000'>
        <Image src={profPic} wrapped ui={false}/ >
        <Card.Content>
          <Card.Header className='profile_head'> <text className='profilecard_name'> {props.username} </text>
            {(currUser?.displayName && !(currUser?.displayName === props.username)) &&
            <Button toggle active={followActive} className="follow_btn" onClick={handleFollow}>
                {followBtnDisp}
            </Button>}
          </Card.Header>
          <Card.Meta>

            {(currUser?.displayName && (currUser?.displayName === props.username)) &&
                <Button size='tiny' className='edit_btn' size='sm' onClick={handleEdit}>edit</Button>
             }
          </Card.Meta>
          <Card.Description>
            {editMode ? (
             <Form >
               <Form.Field >
                 <Input className='bio_edit'
                    onChange={(e) => setBioText(e.target.value)} placeholder='Update your bio...' />

               </Form.Field>
               <Form.Field>
                <label>Change your profile picture </label>
                 <input type='file'
                    onChange={(e) => {setProfPic(e.target.files[0]); setFileSelected(1)}}  />
               </Form.Field>
              <Button variant="success" size='tiny' onClick={handleSubmit}>Update</Button>
              <Button variant="success" size='tiny' onClick={() => setEditMode(false)}>Cancel</Button>
             </Form>
            ) :
             (<text className='profile_bio'>
                {bioText}
              </text>)
            }

          </Card.Description>
        </Card.Content>
        <Card.Content extra>
          <a>
            <Icon name='user' />
            {numFollowers} Followers
          </a>
        </Card.Content>
      </Card>
    )
}

export default ProfileCardv2;