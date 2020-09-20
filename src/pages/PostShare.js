import React, {useEffect, useState} from 'react'
import Post from '../components/Post'
import firebase from 'firebase'
import {db, auth} from '../firebase'
import HomeBody from '../styles/HomeBody.css'

function PostShare(props) {
    const [currUser, setCurrUser] = useState(firebase.auth().currentUser);
    const [caption, setCaption] = useState('')
    const [username, setUsername] = useState('')
    const [iURL, setiURL] = useState('')
    const [auth, setAuth] = useState('')

    useEffect(() => { //a change in authorization
        const unsubscribe = firebase.auth().onAuthStateChanged((authUser) => {
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

    if (props.match.params.postid) {
        db.collection('posts').doc(props.match.params.postid).get().then((doc)=>{
            if (doc.data()) {
            setCaption(doc.data().caption)
            setUsername(doc.data().username)
            setiURL(doc.data().imageURL)
            setAuth(doc.data().authorId)
            }
        })
    }


return (<div>
            <div className='shared_post'>
            <Post key={props.match.params.postid}
                    postId={props.match.params.postid}
                    user={currUser}
                    caption={caption}
                    username={username}
                    imageURL={iURL}
                    author={auth}
                />
             </div>
         </div>)
}
export default PostShare;

