import React, {useState, useEffect} from 'react';
import {Form, ProgressBar, Card, Accordion} from 'react-bootstrap'
import Post from './Post'
import {Button, Icon} from 'semantic-ui-react'
//firebase
import {storage, db, auth} from '../firebase'
import firebase from "firebase";

function CreatePostForm (props) {
    const [imageFile, setImageFile] = useState(null);
    const [caption, setCaption] = useState('');
    const [title, setTitle] = useState('')
    const [progress, setProgress] = useState(0);
    const [currUser, setCurrUser] = useState(null);


    // to identify a change in authorization
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((authUser) => {
            if (authUser) {
                //user has logged in i.e. there is an authUser
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

    // sets user inputted file to state
    function handleFileChange(e) { 
        if(e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }

    };
    
    
    // uploads content to firebase storage
    function handleSubmit(e) { 
        e.preventDefault() //default action of submitting form is prevented
        
        const fileName = imageFile?.name;
        const uploadTask = storage.ref().child('images/' + fileName).put(imageFile);

        console.log(uploadTask)
        uploadTask.on(
            "state_changed",
            (snapshot) => {
                //progress bar that is being displayed
                const currProgress = Math.round( //dynamically keep track of progress
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                );

                setProgress(currProgress);

            },
            (error) => {
                console.log(error); //if there was an upload error
                alert(error.message);
            },
            () => { //when completed uploading
                storage
                    .ref('images')
                    .child(imageFile.name)
                    .getDownloadURL() //get download link to display post
                    .then(url => {
                        //put image and details in db
                        db.collection("posts").add({
                            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                            authorId: currUser.uid,
                            caption: caption,
                            title: title,
                            imageURL: url,
                            username: props.username,
                            likes: 0

                        });

                        setCaption("");
                        setTitle("")
                        setImageFile(null);
                        setProgress(0);
                    });
            }
        );
    };


return (
<Accordion defaultActiveKey="1">
  <Card>
    <Card.Header>
      <Accordion.Toggle as={Button} color='primary' variant="link" eventKey="0">
        <Icon name='pencil alternate'/> Post to ClipIt
      </Accordion.Toggle>
    </Card.Header>
    <Accordion.Collapse eventKey="0">
      <Card.Body>
         <div class="row justify-content-center" id="postForm">
            <Form>
                <Form.File label=<h4>Clip file:</h4>
                    onChange={handleFileChange}
                />
                <ProgressBar animated now={progress} max="100"/>
                <hr/>
                <h4>Clip details:</h4>
                <Form.Control type="text" placeholder="Title..." value={title}
                    onChange={e => setTitle(e.target.value)}
                />
                <Form.Control type="text" placeholder="Description..." value={caption}
                    onChange={e => setCaption(e.target.value)}
                />
                <hr />
                <Button color='green' type="post" onClick={handleSubmit}>
                <Icon name='check circle outline'/>
                 Post</Button>
            </Form>
        </div>
      </Card.Body>
    </Accordion.Collapse>
   </Card>
</Accordion>)
}

export default CreatePostForm;
