import React, {useState, useEffect, useContext} from 'react'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import firebase from 'firebase'
import {db, storage} from '../firebase'
import Avatar from "@material-ui/core/Avatar"
import {Card} from 'react-bootstrap'
import { Button, Icon, Label, Image, Form, Accordion, Popup} from 'semantic-ui-react'
import '../styles/Post.css'

const DEFAULT_PROFPIC = 'https://firebasestorage.googleapis.com/v0/b/react-gaming-sm.appspot.com/' +
                        'o/profiles%2FdefaultProfPic.png?alt=media&token=d265d4ae-2252-4c26-98d8-e879122014bf'

export function Post(props) {
    //state variables:
    const [comments, setComments] = useState([]);
    const [comment, setComment] = useState("");
    const [shareShow, setShareShow] = useState(false);
    const[currUser, setCurrUser] = useState(firebase.auth().currentUser);
    const [postLikes, setPostLikes] = useState(0);
    const [profPic, setProfPic] = useState(null)
    const [shareLink, setShareLink] = useState('localhost:3000/'.concat(props.postId));

    const[followActive, setFollowActive] = useState(() => {  //follow button color handling
        var uid;                           //NOTE: useState is a function because initial state value depends on db
        if (currUser) {
        db.collection('userData').where('displayName', '==', currUser.displayName).limit(1).get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                uid = doc.id //user id of logged-in person
            })
            //checking if post's user is already followed by the logged in person
            db.collection('userData').doc(uid).get().then((snapShot) => {
                var followedUsersEl = snapShot.data().followedUsers
                if(followedUsersEl.includes(props.author)) { //the post's user is already being followed
                    setFollowActive(true);
                } else { //the post's user is not being followed yet
                    setFollowActive(false);
                }
            })
        })
    }})

    const [followBtnDisp, setFollowBtnDisp] = useState(() => { //follow handling
        var uid;                              //NOTE: useState is a function because initial state value depends on db
        if (currUser) {
        db.collection('userData').where('displayName', '==', currUser.displayName).limit(1).get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                uid = doc.id //user id of logged-in person
            })

            //checking if post's user is already followed by the logged in person
            db.collection('userData').doc(uid).get().then((snapShot) => {
                var followedUsersEl = snapShot.data().followedUsers
                if(followedUsersEl.includes(props.author)) { //the post's user is already being followed
                    setFollowBtnDisp("Following");
                } else { //the post's user is not being followed yet
                    setFollowBtnDisp("Follow")
                }
            })
        })
    }})





    //useEffect methods for dynamic updating:
    //useEffect for follow handling
    useEffect(() =>{
        let unsubscribe;
        var queryString = '';
        if (props.postId && props.user) {
            queryString = props.user.displayName;
        }
        unsubscribe = db.collection('userData').where('displayName', '==', queryString).limit(1).onSnapshot
        ((querySnapshot) => {
            var uid;
            querySnapshot.forEach((doc) => {
                uid = doc.id //user id of logged-in person
            })
            if (uid) {
            //checking if post's user is already followed by the logged in person
            db.collection('userData').doc(uid).get().then((snapShot) => {
                var followedUsersEl = snapShot.data().followedUsers
                if (followedUsersEl.includes(props.author)) { //post's user is already followed
                    setFollowActive(true)
                    setFollowBtnDisp("Following")

                } else { //post's user is not followed yet
                    setFollowActive(false)
                    setFollowBtnDisp("Follow")

                }
            })}
        });

        return () => {
            unsubscribe();
        };
    }, [followBtnDisp]);

    //useEffect for comment handling
    useEffect(() =>{
        let unsubscribe;
        if (props.postId) {
            unsubscribe = db
                .collection('posts')
                .doc(props.postId)
                .collection('comments')
                .orderBy('timestamp', 'asc')
                .onSnapshot((snapshot) => {
                    setComments(snapshot.docs.map((doc) => doc.data()));
                });
        }
        return () => {
            unsubscribe();
        };
    }, [props.postId]);


    //useEffect for like handling
    useEffect(() =>{
        let unsubscribe;
        if (props.postId) {
            unsubscribe = db
                .collection('posts')
                .doc(props.postId)
                .onSnapshot((doc) => {
                    if (doc.data()) {
                    setPostLikes(doc.data().likes);
                    }
                });
        }
        return () => {
            unsubscribe();
        };
    }, [props.postId]);

    useEffect(() =>{      //useEffect for profile pic
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
                       if (profPicEl) {
                        setProfPic(profPicEl);
                       }
                   })
               }
            })
        return () => {
            unsubscribe();
        };
    }, [props.username]);






    //functions for button responses:

    function postComment(event) { //publish comment to db
        event.preventDefault();
        db.collection("posts").doc(props.postId).collection("comments").add({
            text: comment,
            username: props.user.displayName,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        setComment('');
    }

    function handleLike(event) { //update like count to db
        event.preventDefault();
        //getting the user id of the loggedin user's doc
        var uid;
        db.collection('userData').where('displayName', '==', props.user?.displayName).limit(1).get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                uid = doc.id //user id of logged-in person
            })
            //checking if post is in the likedPosts array for the logged in user
            db.collection('userData').doc(uid).get().then((snapShot) => {
                var likedPostsEl = snapShot.data().likedPosts
                if (likedPostsEl.includes(props.postId)) { //post already liked
                    db.collection('userData').doc(uid).update({ //removing from liked posts
                        likedPosts: firebase.firestore.FieldValue.arrayRemove(props.postId)
                    })
                    db.collection("posts").doc(props.postId).update({ //changing the # of likes
                        likes: firebase.firestore.FieldValue.increment(-1),
                    })
                } else { //post is not liked yet
                    db.collection('userData').doc(uid).update({ //adding to liked posts
                        likedPosts: firebase.firestore.FieldValue.arrayUnion(props.postId)
                    })
                    db.collection("posts").doc(props.postId).update({ //changing the # of likes
                        likes: firebase.firestore.FieldValue.increment(1),
                    })
                }
            })
        })
    }


    function handleDelete(event) { //delete the post document from db
        event.preventDefault();
        db.collection("posts").doc(props.postId).delete(); //delete from posts collection
        //delete from userData collection
        //getting the user id of the loggedin user's doc
        var uid;
        db.collection('userData').where('displayName', '==', props.user?.displayName).limit(1).get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                uid = doc.id //user id of logged-in person
            })
            db.collection('userData').doc(uid).get().then((snapShot) => {
                var likedPostsEl = snapShot.data().likedPosts
                if (likedPostsEl.includes(props.postId)) { //post already liked
                    db.collection('userData').doc(uid).update({ //removing from liked posts
                        likedPosts: firebase.firestore.FieldValue.arrayRemove(props.postId)
                    })
                }
            })
        })
    }


    function handleFollow(event) {
        event.preventDefault();
        //getting the user id of the loggedin user's doc
        var uid;
        db.collection('userData').where('displayName', '==', props.user.displayName).limit(1).get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                uid = doc.id //user id of logged-in person
            })

            //checking if post's user is already followed by the logged in person
            db.collection('userData').doc(uid).get().then((snapShot) => {
                var followedUsersEl = snapShot.data().followedUsers
                if(followedUsersEl.includes(props.author)) { //the post's user is already being followed
                    db.collection('userData').doc(uid).update({ //removing from liked posts
                        followedUsers: firebase.firestore.FieldValue.arrayRemove(props.author),
                        followedUsersByDN: firebase.firestore.FieldValue.arrayRemove(props.username)
                    })
                    db.collection('userData').where('userID', '==', props.author).limit(1).get().then((snap) => {
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
                        followedUsers: firebase.firestore.FieldValue.arrayUnion(props.author),
                        followedUsersByDN: firebase.firestore.FieldValue.arrayUnion(props.username)
                    })
                    //increasing follower count
                    db.collection('userData').where('userID', '==', props.author).limit(1).get().then((snap) => {
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

    let caption = props.caption
    let title = props.title
    let username = props.username
    let imageURL = props.imageURL
    let output = <div></div>

    if (imageURL) { //post MUST have media content
        output = (
        <div className="post">
         <Card>
            <Card.Header>
                <div className="post_header">
                    {profPic === DEFAULT_PROFPIC ? (<Avatar className="post_avatar" alt={username} src='/'/>) :
                     (<Avatar className="post_avatar" alt={username} src={profPic}/>)}

                    <Link to={`/profile/${username}`} className='profile_link'><h3>{username}</h3></Link>

                    {(props.user?.displayName && !(props.user?.displayName === props.username) && props.displayMode===false) &&
                    <Button toggle active={followActive} className="follow_btn" onClick={handleFollow}>{followBtnDisp}</Button>}

                    {(props.user?.displayName === props.username) &&
                    <Button small icon color='black' className="delete_btn" onClick={handleDelete}>
                        <Icon name='trash'/>
                    </Button>}
                </div>
            </Card.Header>

            <Card.Body className = 'post_body'>
                {(props.imageURL.slice(-57, -53) === '.jpg' || props.imageURL.slice(-57, -53) === '.png') ?
                (<Image rounded className="post_image" src={props.imageURL} />) :
                (<iframe className="post_video" width="500" height="281.25" src={imageURL} frameborder="0" allowfullscreen></iframe>)}

                <div className='post_btns'>
                    <Button  as='div' labelPosition='right' disabled={!props.user} onClick ={handleLike} >
                        <Button icon color='red'><Icon name='heart'/></Button>
                        <Label as='a' basic color='red' pointing='left'>{postLikes}</Label>
                    </Button>

                    <Popup
                      content='Share Link Copied!'
                      on='click'
                      pinned
                      trigger=
                        {<Button primary onClick={() => {navigator.clipboard.writeText('react-gaming-sm.web.app/'.concat(props.postId))}}>
                        <Icon name='share square' />
                        Share
                        </Button>}
                    />
                </div>

                <h2 className='post_title'> {props.title} </h2>
                <h3 className="post_text"> {caption} </h3>
                <hr/>

                <div className="post_comments_list">
                    {comments.map((comment) => (
                        <p className="post_comment_element">
                            <Link to={`/profile/${comment.username}`} className='profile_link'>
                                <strong>{comment.username}</strong>
                            </Link>
                            {comment.text}
                        </p>
                    ))}
                </div>

                {(props.user && props.displayMode===false) &&
                (<div className="comment_wrap">
                  <Form className="comment_field">
                    <Form.Field  size="sm" type="text" >
                      <input  placeholder="Add a comment..." value={comment} onChange={(e) => setComment(e.target.value)}/>
                    </Form.Field>
                  </Form>
                  <Button icon primary size='sm' className="comment_btn" disabled={!comment} onClick={postComment}>
                    <Icon name='comment alternate' />
                  </Button>
                </div>)}
            </Card.Body>

        </Card>
        <br />
       </div>  );
    }

    return output;
}

export default Post;



