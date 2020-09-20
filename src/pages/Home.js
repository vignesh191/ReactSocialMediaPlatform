import React, {useEffect, useState} from 'react'
import CreatePostForm from '../components/CreatePostForm'
import PostListGrid from '../components/PostListGrid'
import {db, auth} from '../firebase'
import {Card} from 'react-bootstrap'
import HomeBody from '../styles/HomeBody.css'
import MainNavbar from '../components/MainNavbar'
import firebase from 'firebase'
import {Container} from 'semantic-ui-react'
import MediaGall from '../components/MediaGall'


function Home() {
    const [postList, setPostList] = useState([]);
    const[search, setSearch] = useState('');
    const[currUser, setCurrUser] = useState(firebase.auth().currentUser);

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

    useEffect(() => {
        db.collection('posts').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
            const currPosts = snapshot.docs;
            setPostList(currPosts.map(doc => ({
                id: doc.id,
                post : doc.data()
            })));
        })
    }, []);


    return (
     <div>
        {currUser?.displayName ? ( //if logged in
            <div className='createForm'>
                <CreatePostForm  username={currUser.displayName}/>
             </div>
        ): (
            <Card className='login_check'>
                <Card.Header>
                    *You need to login to upload*
                </Card.Header>
            </Card>
        )}
        <div>
        <br/>
        <Container textAlign='left'>

        <h1> Explore All Clips: </h1>
        </Container>
        </div>
        <MediaGall />

     </div>
    )
}

export default Home