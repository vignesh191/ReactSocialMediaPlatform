import React, {useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import IconButton from '@material-ui/core/IconButton';
import {db, auth} from '../firebase'
import FeedStyle from '../styles/FeedStyle.css'
import firebase from 'firebase'
import { Link } from 'react-router-dom'
import ReactPlayer from 'react-player'


export default function PictureGrid() {
    const useStyles = makeStyles((theme) => ({
      root: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        overflow: 'hidden',
        backgroundColor: theme.palette.background.paper,
      },
      gridList: {
        flexWrap: 'nowrap',
        // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
        transform: 'translateZ(0)',
      },
      title: {
        color: theme.palette.background.default,
      },
      titleBar: {
        background:
          'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
      },
    }));

    const classes = useStyles();
    const [tileData, setTileData] = useState([])
    const [currUser, setCurrUser] = useState(firebase.auth().currentUser)


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
        console.log(currUser)
        return () => {
            //perform cleanup actions
            unsubscribe();
        }
    }, []);


    useEffect(() => { //the list for "you may like" (posts by other users besides the currUser)
        if (currUser) {
            db.collection('posts').onSnapshot(snapshot => {
                let notUsersPosts = snapshot.docs.filter((doc) =>
                    doc.data().authorId !== currUser?.uid
                )
                setTileData(notUsersPosts.map(doc => ({
                    id: doc.id,
                    post : doc.data()
                })));
            })
    }}, [currUser]);

  return (
    <div className={classes.root}>
      <GridList className={classes.gridList} cols={3.5}>
        {tileData.map((tile) => (
          <GridListTile key={tile.post.imageURL}>
                {(tile.post.imageURL.slice(-57, -53) === '.jpg' || tile.post.imageURL.slice(-57, -53) === '.png') ?
                    <img className="post_image" src={tile.post.imageURL} /> :
                    <ReactPlayer className="post_video" url={tile.post.imageURL} playing='true' loop='true' volume='0' />
                }
            <Link to={`/profile/${tile.post.username}`} className='feed_profile_link'>
              <GridListTileBar
              title={tile.post.caption}
              subtitle={<span>by: {tile.post.username}</span>}

              classes={{
                root: classes.titleBar,
                title: classes.title,
              }}
            />
            </Link>
          </GridListTile>
        ))}
      </GridList>
    </div>
  );
}