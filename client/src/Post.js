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
    const [likes, setlikes] = useState([]);
    const [liked,setLiked] = useState("false");

    const postComment = (e) => {
      e.preventDefault();

      axios.post("/api/comment",{
        comment: comment,
        user: user.displayName,
        post_id: postId
      });
      setComment("");
    };

    const updateLike = (e) => {
      e.preventDefault();
      
      if(user&&likes.map((like) => like.user).indexOf(user.displayName)==-1){
        axios.post("/api/like",{
          user: user.displayName,
          post_id: postId
        });
      }
    };

    const data={post_id:postId};
    const fetchComments = async() =>
    await axios.get('/api/syncComment',{"params":data}).then(response => {
      setComments(response.data);
    });
  

    const fetchLikes = async() =>
    await axios.get('/api/syncLikes',{"params":data}).then(response => {
      setlikes(response.data);
      // console.log("Likes are >>>>>",response);
    });

    useEffect(() => {
      var pusher = new Pusher('cccdc78c6de2ce551133', {
        cluster: 'ap2'
      });
  
      var channel = pusher.subscribe('posts');
      channel.bind('updated', function(data) {
        fetchComments();
        fetchLikes();
      });
    })

    useEffect(() => {
      fetchComments();
    }, []);


    useEffect(() => {
      fetchLikes();
    }, []);


    return (
      <div className="post" ref={ref}>
        <div className="post__header">
          <Avatar
            className="post__avatar"
            alt={username}
            src={"https://avatars.dicebear.com/api/male/"+{username}+".svg"}
          />
          <h3>{username}</h3>
        </div>

        <img className="post__image" src={imageUrl} alt="post" />
        <h4 className="post__text">
          { user && (
            likes.map((like) => like.user).indexOf(user.displayName)==-1 ?
            <div className="like_btn" onClick={updateLike}>♡</div>
              :<div className="like_btn active" onClick={updateLike} color="red"  >❤️</div>
            )}
            {likes.length} Likes
        </h4>
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
