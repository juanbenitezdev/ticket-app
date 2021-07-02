import axios from "axios";

export default ({ req }) => {
  if (typeof window === "undefined") {
    // we are on the server since windows only exists on the browser
    // http://SERVICENAME.NAMESPACE.svc.cluster/api/users/currentuser
    return axios.create({
      baseURL: "https://ticketing.juanbenitez.dev/",
      headers: req.headers,
    });
  } else {
    // we are on the browser
    return axios.create({
      baseURL: "/",
    });
  }
};
