import React, {useState, useEffect} from 'react'
import { Modal } from 'react-bootstrap'
import '../styles/Post.css'
import Post from '../components/Post'
import { Button, Icon } from 'semantic-ui-react'

function PostModal(props) {

  return (
    <Modal
      {...props}
      size="md"

      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Body>
    <Post className='modal_post'   postId={props.pid}
                title = {props.title}
                user={props.currUser}
                caption={props.caption}
                username={props.username}
                imageURL={props.imageURL}
                author={props.authorId}
                displayMode={false} />
      </Modal.Body>

    </Modal>
  );
}

export default PostModal;