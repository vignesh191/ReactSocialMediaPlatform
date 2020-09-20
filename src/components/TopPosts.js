import React, {useState, useEffect} from 'react';
import GridList from '@material-ui/core/GridList';
import { makeStyles } from '@material-ui/core/styles';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import { Container, Form, Button, Input, Card } from 'semantic-ui-react';
import { Modal } from 'react-bootstrap'
import '../styles/HomeBody.css'
import PostModal from '../components/PostModal'
import {db, auth} from '../firebase'
import firebase from 'firebase'
import ReactPlayer from 'react-player'

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
  },
  gridList: {
    width: 500,
    height: 'auto',
    overflowY: 'auto'
  },
  indvCell: {
    borderRadius: 25,
  },
}));

function TopPosts(props) {
  const classes = useStyles();
  const [tileData, setTileData] = useState([])
  const [currUser, setCurrUser] = useState(firebase.auth().currentUser)
  const[show, setShow] = useState(false)
  const[search, setSearch] = useState('');
  const[currTile, setCurrTile] = useState(null)

  const handleClose = () => setShow(false) ;
  const handleShow = (e) => {setShow(true)};



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


    useEffect(() => {
        if (currTile) {
            setCurrTile(currTile)
            console.log(currTile)
        }
    }, [currTile]);

return (
    <div>
    <Card fluid>
    <Card.Header>
        <h3 className='topthree_title'>Popular Clips:</h3>
    </Card.Header>
    <Card.Content>
    <div className={classes.root}>
      <GridList cellHeight={83.33} className={classes.gridList} cols={3} >
        {props.postList.map((tile) => (
          <GridListTile key={tile.post.imageURL} cols={1} >

            <Button variant='link' onClick={() => {setCurrTile(tile); setShow(true)}} className='pic_button'>
            {(tile.post.imageURL.slice(-57, -53) === '.jpg' || tile.post.imageURL.slice(-57, -53) === '.png') ?
                <img className="post_image" src={tile.post.imageURL} tile={tile}/> :
                <ReactPlayer height='80' width='142.22' tile={tile} className="post_video" url={tile.post.imageURL} playing='true' loop='true' volume='0' />
            }
            </Button>

          </GridListTile>
        ))}
      </GridList>
      </div>
      </Card.Content>
      </Card>

          {currTile && <PostModal show={show} onHide={handleClose} pid={currTile?.id} currUser={currUser} caption={currTile?.post.caption} username={currTile?.post.username}
             imageURL= {currTile?.post.imageURL} title= {currTile?.post.title} authorId = {currTile?.post.authorId}/>}
    </div>

)

}

export default TopPosts;