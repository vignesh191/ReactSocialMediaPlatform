import React, {useState, useEffect} from 'react';
import GridList from '@material-ui/core/GridList';
import { makeStyles } from '@material-ui/core/styles';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import { Container, Form, Button, Input } from 'semantic-ui-react';
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
    width: 1200,
    height: 'auto',
    overflowY: 'auto'
  },
  indvCell: {
    borderRadius: 25,
  },
  titleBar: {
    background:
      'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
  },
}));

function MediaGall(props) {
  const classes = useStyles();
  const [tileData, setTileData] = useState([])
  const [currUser, setCurrUser] = useState(firebase.auth().currentUser)
  const[show, setShow] = useState(false)
  const[search, setSearch] = useState('');
  const[currTile, setCurrTile] = useState(null)

  const handleClose = () => setShow(false) ;
  const handleShow = (e) => {
    setShow(true)};



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
        db.collection('posts').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
            const currPosts = snapshot.docs;
            setTileData(currPosts.map(doc => ({
                id: doc.id,
                post : doc.data()
            })));
        })
    }, []);

    useEffect(() => {
        if (currTile) {
            setCurrTile(currTile)
            console.log(currTile)
        }
    }, [currTile]);

    let filteredTileData = tileData.filter(
        (tile) => {
            return (tile.post.caption.toLowerCase().indexOf(search.toLowerCase()) !== -1) ||
                   (tile.post.username.toLowerCase().indexOf(search.toLowerCase()) !== -1);
        }
    );

return (
    <div>
    <Container>
    <div className='search_wrap'>
     <Form >
       <Form.Field >
         <Input style={{width: "1020px"}} className='search_field' value={search}
            onChange={(e) => setSearch(e.target.value)} placeholder='Search for Clips...' />
       </Form.Field>

     </Form>
    <Button secondary size='sm' className="search_btn"
      onClick={() => setSearch('')}>
     Clear</Button>
    </div>
    <hr className='line' />
    </Container>

    <Container>


    <div className={classes.root}>
      <GridList cellHeight={200} className={classes.gridList} cols={3} >
        {filteredTileData.map((tile) => (
          <GridListTile key={tile.post.imageURL} cols={1} >

            <Button variant='link' onClick={() => {setCurrTile(tile); setShow(true)}} className='pic_button'>
            {(tile.post.imageURL.slice(-57, -53) === '.jpg' || tile.post.imageURL.slice(-57, -53) === '.png') ?
                <img className="post_image" src={tile.post.imageURL} tile={tile}/> :
                <ReactPlayer height='160' width='284.44' tile={tile} className="post_video" url={tile.post.imageURL} playing='true' loop='true' volume='0' />
            }
            {tile.post.title && (<GridListTileBar
              title={tile.post.title}
              titlePosition="bottom"
              className={classes.titleBar}
            />)}
            </Button>
          </GridListTile>
        ))}
      </GridList>
      <hr/>
      </div>
          {currTile && <PostModal show={show} onHide={handleClose} pid={currTile?.id} currUser={currUser} caption={currTile?.post.caption} username={currTile?.post.username}
             imageURL= {currTile?.post.imageURL} title= {currTile?.post.title} authorId = {currTile?.post.authorId}/>}

    </Container>
    </div>
)

}

export default MediaGall;