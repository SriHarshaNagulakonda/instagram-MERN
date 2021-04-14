import React, { useState, useEffect, forwardRef } from "react";
import "./Post.css";
import Avatar from "@material-ui/core/Avatar";
import axios from './axios';
import Pusher from "pusher-js"
import {Button} from "@material-ui/core";

const Post = forwardRef(
  ({ user, username, postId, imageUrl, caption }, ref) => {
    const [comments, setComments] = useState([]);
    const [comment, setComment] = useState("");

    const postComment = (e) => {
      e.preventDefault();

      axios.post("/api/comment",{
        comment: comment,
        user: user.displayName,
        post_id: postId
      });
      setComment("");
    };

    const data={post_id:postId};
    const fetchComments = async() =>
    await axios.get('/api/syncComment',{"params":data}).then(response => {
      console.log("Comments are >>>>>",response);
      setComments(response.data);
    });
  
    useEffect(() => {
      var pusher = new Pusher('cccdc78c6de2ce551133', {
        cluster: 'ap2'
      });
  
      var channel = pusher.subscribe('posts');
      channel.bind('updated', function(data) {
        fetchComments();
      });
    })

    useEffect(() => {
      fetchComments();
    }, []);

    return (
      <div className="post" ref={ref}>
        <div className="post__header">
          <Avatar
            className="post__avatar"
            alt={username}
            src="https://avatars.dicebear.com/api/male/+{username}.svg"
          />
          <h3>{username}</h3>
        </div>

        <img className="post__image" src={imageUrl} alt="post" />
        <h4 className="post__text">
         <b> {username}</b> <span className="post__caption">{caption}</span>
        </h4>

        
        <div className="post__comments">
          Comments
          {comments.map((comment) => (
            <p>
              <b>{comment.user}</b> {comment.comment}
            </p>
          ))}
        </div>

        {user && (
          <form className="post__commentBox">
            <input
              className="post__input input"
              type="text"
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button
              disabled={!comment}
              className="post__button"
              type="submit"
              onClick={postComment}
            >
              Post
            </button>
          </form>
        )}
      </div>
    );
  }
);

export default Post;
