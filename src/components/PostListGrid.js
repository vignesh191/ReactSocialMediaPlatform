import React, { useState, useEffect} from 'react'
import {Post} from './Post'
import {Form, FormControl, Button} from 'react-bootstrap'
import HomeBody from '../styles/HomeBody.css'
import {auth} from '../firebase'
import Grid from "@material-ui/core/Grid"
import Container from "@material-ui/core/Container"

function PostListGrid(props) {
    const[currUser, setCurrUser] = useState(null);

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


    let filteredPostList = props.postList.filter(
        (postEl) => {
            return (postEl.post.caption.toLowerCase().indexOf(props.search.toLowerCase()) !== -1) ||
                   (postEl.post.username.toLowerCase().indexOf(props.search.toLowerCase()) !== -1);
        }
    );

    return <Container fixed> <Grid container spacing={0}>
                {(filteredPostList.length !== 0) ? (filteredPostList.map(({id, post}) =>
                    <Grid item xs={24} sm={12} md={6} spacing={0}>
                    <Post key={id}
                    postId={id}
                    user={currUser}
                    caption={post.caption}
                    username={post.username}
                    imageURL={post.imageURL}
                    author={post.authorId}
                    displayMode={false}
                />
                </Grid>
                )) : (<div></div>)}

            </Grid> </Container>

}

export default PostListGrid;