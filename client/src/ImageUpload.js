import React, { useState,useRef } from "react";
import { storage } from "./firebase";
import "./ImageUpload.css";
import { TextField, Button,LinearProgress } from "@material-ui/core";
import axios from './axios'

const ImageUpload = ({ username }) => {
  const [image, setImage] = useState(null);
  const [url, setUrl] = useState("");
  const [progress, setProgress] = useState(0);
  const [caption, setCaption] = useState("");

  const inputFile = useRef(null);

  const handleChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    const uploadTask = storage.ref(`images/${image.name}`).put(image);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setProgress(progress);
      },
      (error) => {
        console.log(error);
      },
      () => {
        storage
          .ref("images")
          .child(image.name)
          .getDownloadURL()
          .then((url) => {
            setUrl(url);

            axios.post('/api/upload',{
              caption: caption,
              user: username,
              image: url
            });

            setProgress(0);
            setCaption("");
            setImage(null);
          });
      }
    );
  };
  
  const onButtonClick = () => {
   inputFile.current.click();
  };

  return (
    <div className="imageupload">
      <LinearProgress variant="determinate" value={progress} max="100" />
      <div className="row">
        <div className="col-md-6">
          <TextField
            className="input__caption"
              label="Caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
          />
        </div>
        <div className="col-md-6" style={{paddingTop:"10px"}}>
          <input type="file" onChange={handleChange} ref={inputFile} style={{display: 'none'}}/>
          <Button color="primary" variant="contained" onClick={onButtonClick}>Browse Image</Button>
          &nbsp;
          <Button color="secondary" variant="contained" className="imageupload__button" onClick={handleUpload}>
            Upload
          </Button>
        </div>
      </div>
      <br />

    </div>
  );
};

export default ImageUpload;
