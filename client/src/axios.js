import axios from "axios";

const instance=axios.create({
    baseURL: "https://hidden-reaches-52625.herokuapp.com/"
});

export default instance;