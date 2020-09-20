import React, {useState, useEffect, useContext} from 'react'
import { Card, Button } from 'semantic-ui-react'
import Profile from '../styles/Profile.css'
import {db, storage, auth} from '../firebase'
import firebase from 'firebase'
import Avatar from "@material-ui/core/Avatar"

function ProfileSearchCard(props) {
    const[currUser, setCurrUser] = useState(firebase.auth().currentUser);
    const [numFollowers, setNumFollowers] = useState(0);
    const [bioText, setBioText] = useState("");
    const DEFAULT_PROFPIC = 'https://firebasestorage.googleapis.com/v0/b/react-gaming-sm.appspot.com/o/profiles%2FdefaultProfPic.png?alt=media&token=d265d4ae-2252-4c26-98d8-e879122014bf'

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


    useEffect(() =>{ //bio handling
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


console.log(followActive)

return (<div>
          <Card fluid
            href={`/profile/${props.username}`}
            header=<div className='profsearch_header'>
            {props.profPic === DEFAULT_PROFPIC ? (<Avatar className="post_avatar" alt={props.username} src='/'/>) :
            (<Avatar className="post_avatar" alt={props.username} src={props.profPic}/>)}

            <strong className='profsearch_name'> {props.username} </strong>
             {(currUser?.displayName && !(currUser?.displayName === props.username)) &&
            <Button toggle active={followActive} className="profsearch_follow_btn">
                {followBtnDisp}
             </Button>}</div>
            meta= <text className='profsearch_numfollowers'> {numFollowers} Followers </text>
            description={bioText}
          />
        </div>)
}

export default ProfileSearchCard;
