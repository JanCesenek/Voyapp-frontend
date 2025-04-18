import React, { useState, useEffect, useRef, useContext } from "react";
import { useUpdate } from "../hooks/use-update";
import { BsFillFileImageFill } from "react-icons/bs";
import {
  FaCalendarAlt,
  FaWalking,
  FaMapMarkerAlt,
  FaSignOutAlt,
  FaGrinHearts,
  FaFrown,
  FaComment,
  FaCommentMedical,
  FaCommentSlash,
  FaImages,
} from "react-icons/fa";
import { HiOutlineMail, HiOutlinePhone } from "react-icons/hi";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import { OpenStreetMapProvider, GeoSearchControl } from "leaflet-geosearch";
import "leaflet-geosearch/dist/geosearch.css";
import Loading from "./loading";
import Comment from "./comment";
import Button from "./custom/button";
import { api } from "../core/api";
import supabase from "../core/supabase";
import { v4 as uuid } from "uuid";
import { greenIcon, goldIcon, purpleIcon } from "../core/icons";
import { AuthContext } from "../context/AuthContext";

const DestinationDetail = (props) => {
  const { notifyContext } = useContext(AuthContext);

  const lat = localStorage.getItem("lat");
  const lon = localStorage.getItem("lon");
  const curUsername = localStorage.getItem("curUser");
  const token = localStorage.getItem("token");
  const [addComment, setAddComment] = useState(false);
  const [viewComments, setViewComments] = useState(false);
  const [message, setMessage] = useState("");
  const [addReservation, setAddReservation] = useState(false);
  const [people, setPeople] = useState(1);
  const [editPost, setEditPost] = useState(false);
  const [morePics, setMorePics] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState(props.name);
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState(props.description);
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [freeSpots, setFreeSpots] = useState(props.freeSpots);
  const [coords, setCoords] = useState([props.latitude, props.longitude]);
  const fileInputRef = useRef(null);

  const { data, isLoading } = useUpdate("/users");
  const {
    data: destinationsData,
    refetch: refetchDestinations,
    isLoasding: destinationsLoading,
  } = useUpdate("/destinations");
  const { data: likesData, refetch: refetchLikes, isLoading: likesLoading } = useUpdate("/likes");
  const {
    data: dislikesData,
    refetch: refetchDislikes,
    isLoading: dislikesLoading,
  } = useUpdate("/dislikes");
  const {
    data: commentsData,
    refetch: refetchComments,
    isLoading: commentsLoading,
  } = useUpdate("/comments");
  const {
    data: reservationsData,
    refetch: refetchReservations,
    isLoading: reservationsLoading,
  } = useUpdate("/destination-reservations");
  const { data: picsData, isLoading: picsLoading } = useUpdate("/destination-pictures");
  const { data: rentsData, isLoading: rentsLoading } = useUpdate("/rents");

  const postOwner = data?.find((el) => el.username === props.userID);
  const ownerFullName = postOwner?.firstName + " " + postOwner?.lastName;

  const Search = (props) => {
    const map = useMap();
    const { provider } = props;

    useEffect(() => {
      const searchControl = new GeoSearchControl({
        provider,
      });

      map.addControl(searchControl);
      map.on("moveend", () => {
        const center = map.getCenter();
        setCoords([center.lat, center.lng]);
      });

      return () => map.removeControl(searchControl);
    }, [props]);

    return null;
  };

  const handleFileChange = (e) => {
    console.log(e.target.files[0]);
    setImage(e.target.files[0]);
  };

  const getDate = (el) => {
    const date = new Date(el.slice(0, 4), el.slice(5, 7) - 1, el.slice(8, 10));
    const month = date.toLocaleString("default", { month: "short" });
    return `${el.slice(8, 10)} ${month} ${el.slice(0, 4)}`;
  };

  const likeCount = () => {
    let count = 0;
    likesData?.map((el) => {
      if (el.postID === props.id) count++;
    });
    return count;
  };

  const dislikeCount = () => {
    let count = 0;
    dislikesData?.map((el) => {
      if (el.postID === props.id) count++;
    });
    return count;
  };

  const commentCount = () => {
    let count = 0;
    commentsData?.map((el) => {
      if (el.postID === props.id) count++;
    });
    return count;
  };

  const updatePost = async () => {
    const uniqueID = uuid();
    if (image) {
      const { data: listData } = await supabase.storage.from("traveling").list("destinations");
      const curFile = listData.find((el) => props.image.includes(el.name));
      const { data: deletedData, error: deletedError } = await supabase.storage
        .from("traveling")
        .remove([`destinations/${curFile.name}`]);

      if (deletedError) {
        console.log("Failed to delete profile pic...", deletedError);
      } else {
        console.log("Old profile pic deleted successfully...", deletedData);
      }
      const { data, error } = await supabase.storage
        .from("traveling")
        .upload(`destinations/${uniqueID}`, image, {
          cacheControl: "3600",
          upsert: false,
        });

      const { dataGet, errorGet } = await supabase.storage.from("traveling").list("destinations");

      if (error) {
        console.log("Error uploading file...", error);
        notifyContext(
          "Could not upload the file. A file with the same name most likely already exists. Try to rename the file and see if the issues persists!",
          "error"
        );
      } else {
        console.log("File uploaded!", data.path);
      }

      if (errorGet) {
        console.log("Error listing files...", error);
      } else {
        console.log("Files listed!", dataGet);
      }
    }
    const patchReqPayload = {
      name,
      image: image || props.image,
      description,
      startDate: startDate ? new Date(startDate) : props.startDate,
      endDate: endDate ? new Date(endDate) : props.endDate,
      freeSpots: +freeSpots,
      latitude: +coords[0],
      longitude: +coords[1],
    };
    setSubmitting(true);
    await api
      .patch(`/destinations/${props.id}`, patchReqPayload, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      })
      .then(async () => {
        await refetchDestinations();
        notifyContext("Post updated successfully!", "success");
      })
      .catch((err) => {
        console.log(`Patch req - ${err}`);
        notifyContext("Failed to update the post!", "error");
      })
      .finally(() => {
        setSubmitting(false);
        setEditPost(false);
        props.back();
      });
  };

  const likePost = async () => {
    const alreadyLiked = likesData?.find(
      (el) => el.postID === props.id && el.userID === curUsername
    );
    const alreadyDisliked = dislikesData?.find(
      (el) => el.postID === props.id && el.userID === curUsername
    );

    setSubmitting(true);
    if (alreadyLiked) {
      await api
        .delete(`/likes/${alreadyLiked?.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        .then(async () => await refetchLikes())
        .catch((err) => console.log(`Delete req - ${err}`));
    } else if (alreadyDisliked) {
      await api
        .delete(`dislikes/${alreadyDisliked?.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        .then(async () => await refetchDislikes())
        .catch((err) => console.log(`Delete req - ${err}`));
    }
    if (!alreadyLiked) {
      await api
        .post(
          "/likes",
          { userID: curUsername, postID: props.id },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        )
        .then(async () => await refetchLikes())
        .catch((err) => console.log(`Post req - ${err}`));
    }
    setSubmitting(false);
  };

  const dislikePost = async () => {
    const alreadyLiked = likesData?.find(
      (el) => el.postID === props.id && el.userID === curUsername
    );
    const alreadyDisliked = dislikesData?.find(
      (el) => el.postID === props.id && el.userID === curUsername
    );

    setSubmitting(true);
    if (alreadyDisliked) {
      await api
        .delete(`/dislikes/${alreadyDisliked?.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        .then(async () => await refetchDislikes())
        .catch((err) => console.log(`Delete req - ${err}`));
    } else if (alreadyLiked) {
      await api
        .delete(`likes/${alreadyLiked?.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        .then(async () => await refetchLikes())
        .catch((err) => console.log(`Delete req - ${err}`));
    }
    if (!alreadyDisliked) {
      await api
        .post(
          "/dislikes",
          { userID: curUsername, postID: props.id },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        )
        .then(async () => await refetchDislikes())
        .catch((err) => console.log(`Post req - ${err}`));
    }
    setSubmitting(false);
  };

  const commentPost = async () => {
    const postReqPayload = {
      userID: curUsername,
      postID: props.id,
      message,
    };

    setSubmitting(true);
    await api
      .post("/comments", postReqPayload, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      })
      .then(async () => {
        await refetchComments();
        notifyContext("Comment added successfully!", "success");
      })
      .catch((err) => {
        console.log(`Post req - ${err}`);
        notifyContext("Failed to add a comment!", "error");
      })
      .finally(() => {
        setMessage("");
        setAddComment(false);
        setSubmitting(false);
      });
  };

  const anyReservations = reservationsData?.find((el) => el.postID === props.id);
  const anyPics = picsData?.find((el) => el.postID === props.picID);

  const picNumber = () => {
    let count = 0;
    picsData?.map((el) => {
      if (el.postID === props.picID) count++;
    });
    return count;
  };

  const peopleCount = () => {
    let count = 0;
    reservationsData?.map((el) => {
      if (el.postID === props.id) count += el.people;
    });
    return count;
  };
  const spotsLeft = props.freeSpots - peopleCount();

  const createReservation = async () => {
    const postReqPayload = {
      userID: curUsername,
      postID: props.id,
      people: +people,
    };
    setSubmitting(true);
    await api
      .post("/destination-reservations", postReqPayload, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      })
      .then(async () => {
        await refetchReservations();
        notifyContext("Reservation created successfully!", "success");
      })
      .catch((err) => {
        console.log(`Post req - ${err}`);
        notifyContext("Failed to create a reservation!", "error");
      })
      .finally(() => {
        setAddReservation(false);
        setSubmitting(false);
      });
  };

  const showFormHideComments = () => {
    setAddComment(true);
    setViewComments(false);
  };

  const showCommentsHideForm = () => {
    setAddComment(false);
    setViewComments(!viewComments);
  };

  const loading =
    isLoading ||
    likesLoading ||
    dislikesLoading ||
    commentsLoading ||
    destinationsLoading ||
    reservationsLoading ||
    rentsLoading ||
    picsLoading;
  if (loading) return <Loading />;

  return editPost ? (
    <div className="flex relative flex-col [&>*]:my-2 bg-gradient-to-b from-black/50 to-green-500/30 shadow-black shadow-xl rounded-lg p-5 !w-full">
      <FaSignOutAlt
        className="absolute top-5 right-5 hover:cursor-pointer text-[1.5rem]"
        onClick={() => setEditPost(false)}
      />
      <div className="flex items-center">
        <label htmlFor="name" className="min-w-[7rem]">
          Name:
        </label>
        <input
          type="text"
          id="name"
          className="bg-green-600/20 shadow-md shadow-green-600/50 rounded-md focus:outline-none"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="flex items-center">
        <p className="min-w-[7rem]">Image:</p>
        <label htmlFor="pic" className="flex w-[15rem] text-[1rem] ml-5 hover:cursor-pointer">
          <BsFillFileImageFill /> {image ? image.name : "Upload image"}
        </label>
        <input
          type="file"
          name="pic"
          id="pic"
          size="10"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
          ref={fileInputRef}
        />
        {image && (
          <AiFillCloseCircle
            className="w-3 h-3 hover:cursor-pointer mr-2"
            onClick={() => {
              fileInputRef.current.value = null;
              setImage(null);
            }}
          />
        )}
      </div>
      <div className="flex items-center">
        <label htmlFor="description" className="min-w-[7rem]">
          Description:
        </label>
        <textarea
          name="description"
          id="description"
          className="bg-green-600/20 shadow-md shadow-green-600/50 rounded-md focus:outline-none w-[15rem] h-[7rem]"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="flex items-center">
        <label htmlFor="startDate" className="min-w-[7rem]">
          Start date:
        </label>
        <input
          type="date"
          name="startDate"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          id="startDate"
          className="bg-green-600/20 shadow-md shadow-green-600/50 rounded-md focus:outline-none"
        />
      </div>
      <div className="flex items-center">
        <label htmlFor="endDate" className="min-w-[7rem]">
          End date:
        </label>
        <input
          type="date"
          name="endDate"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          id="endDate"
          className="bg-green-600/20 shadow-md shadow-green-600/50 rounded-md focus:outline-none"
        />
      </div>
      <div className="flex items-center">
        <label htmlFor="freeSpots" className="min-w-[7rem]">
          Free spots:
        </label>
        <input
          type="number"
          name="freeSpots"
          value={freeSpots}
          onChange={(e) => setFreeSpots(e.target.value)}
          id="freeSpots"
          className="bg-green-600/20 shadow-md shadow-green-600/50 rounded-md focus:outline-none max-w-[3rem] px-2"
        />
      </div>
      <div className="flex items-center">
        <div className="min-w-[7rem]">Location:</div>
        <MapContainer
          className="!w-[20rem] !h-[10rem] sm:!w-[30rem] sm:!h-[15rem] !text-black rounded-lg"
          center={coords}
          zoom={13}
          scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Search provider={new OpenStreetMapProvider()} />
          {destinationsData?.map((el) => {
            return (
              <Marker key={el.id} position={[el.latitude, el.longitude]} icon={goldIcon}>
                <Popup>{el.name}</Popup>
              </Marker>
            );
          })}
          {rentsData?.map((el) => {
            return (
              <Marker key={el.id} position={[el.latitude, el.longitude]} icon={purpleIcon}>
                <Popup>{el.name}</Popup>
              </Marker>
            );
          })}
          <Marker position={coords} icon={greenIcon}>
            <Popup>Default marker - controllable. This location will be saved.</Popup>
          </Marker>
        </MapContainer>
      </div>
      <Button
        title={submitting ? "Submitting..." : "Submit"}
        classes={`self-center text-[1rem] ${submitting && "pointer-events-none opacity-50"}`}
        onClick={updatePost}
      />
    </div>
  ) : (
    <div
      className={`relative flex flex-col items-center bg-gradient-to-b from-black/80 to-green-700/60 shadow-black shadow-xl rounded-md p-5 my-20 [&>*]:my-2 ${
        submitting && "cursor-not-allowed opacity-70 pointer-events-none"
      }`}>
      <FaSignOutAlt
        className="absolute top-5 right-5 hover:cursor-pointer text-[1.5rem]"
        onClick={props.back}
      />
      <h1 className="text-[1.8rem] font-bold !mt-10 md:!mt-0">
        {props.name} with {ownerFullName}
      </h1>
      <img
        src={postOwner?.profilePicture}
        alt="profile pic"
        className="w-auto h-auto max-w-[5rem] max-h-[5rem] rounded-lg"
      />
      <div className="flex flex-col md:flex-row [&>*]:mx-5">
        <div className="[&>*]:my-2">
          <div className="flex items-center">
            <HiOutlineMail className="mr-2" />
            <p>{postOwner?.email}</p>
          </div>
          <div className="flex items-center">
            <HiOutlinePhone className="mr-2" />
            <p>{postOwner?.phone}</p>
          </div>
          <div className="relative flex flex-col">
            <img
              src={props.image}
              alt="some img"
              className="w-auto h-auto max-w-[20rem] max-h-[20rem] rounded-lg"
            />
            {anyPics && (
              <p
                className="absolute bottom-0 left-0 flex items-center [&>*]:mx-1 rounded-bl-lg bg-black/50 hover:cursor-pointer"
                onClick={() => setMorePics(true)}>
                <FaImages />
                <span>
                  {picNumber()} more {picNumber() === 1 ? "picture" : "pictures"}
                </span>
              </p>
            )}
          </div>
        </div>
        <div className="[&>*]:my-2">
          <div className="flex items-center">
            <FaCalendarAlt className="mr-2" />
            <p>
              {getDate(props.startDate)} - {getDate(props.endDate)}
            </p>
          </div>
          <div className="flex items-center">
            <FaWalking className="mr-2" />
            <p>
              {props.freeSpots} {props.freeSpots > 1 ? "people" : "person"}{" "}
              {anyReservations
                ? `(${
                    spotsLeft > 0 ? `${peopleCount()} spots left` : "reservation full, sorry..."
                  })`
                : "(no reservations yet)"}
            </p>
          </div>
          <div className="flex items-center">
            <FaMapMarkerAlt className="mr-2" />
            <p>{props.distance} km away from you</p>
          </div>
          <MapContainer
            className="!w-[20rem] !h-[10rem] !text-black rounded-lg"
            center={[props.latitude, props.longitude]}
            zoom={8}
            scrollWheelZoom={false}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {destinationsData?.map((el) => {
              return (
                <Marker key={el.id} position={[el.latitude, el.longitude]} icon={goldIcon}>
                  <Popup>{el.name}</Popup>
                </Marker>
              );
            })}
            {rentsData?.map((el) => {
              return (
                <Marker key={el.id} position={[el.latitude, el.longitude]} icon={purpleIcon}>
                  <Popup>{el.name}</Popup>
                </Marker>
              );
            })}
            <Circle center={[+lat, +lon]} radius={200} />
          </MapContainer>
        </div>
      </div>
      {spotsLeft > 0 && props.userID !== curUsername && token && (
        <p
          className="text-green-400 underline hover:cursor-pointer"
          onClick={() => setAddReservation(!addReservation)}>
          {addReservation ? "Hide" : "Make a reservation"}
        </p>
      )}
      {addReservation && (
        <div className="my-5 flex flex-col [&>*]:my-2 p-5 bg-gradient-to-b from-black/50 to-green-500/30 shadow-black/50 shadow-lg rounded-lg">
          <div className="flex items-center">
            <label htmlFor="people">People:</label>
            <input
              type="number"
              name="people"
              id="people"
              min="1"
              className="bg-transparent border border-white rounded-md ml-2"
              max={spotsLeft}
              value={people}
              onChange={(e) => setPeople(e.target.value)}
            />
          </div>
          <Button
            title={submitting ? "Submitting..." : "Submit"}
            classes={`${
              (people > spotsLeft || people < 1 || submitting) && "pointer-events-none opacity-50"
            } !text-[1rem] self-center`}
            onClick={createReservation}
          />
        </div>
      )}
      <p className="max-w-[40rem]">{props.description}</p>
      <div className="flex w-4/5 items-center justify-around pb-2 border-b border-green-500">
        <div className="flex items-center">
          <FaGrinHearts
            className={`mr-2 hover:cursor-pointer ${!token && "pointer-events-none opacity-50"}`}
            onClick={likePost}
          />
          <p>{likeCount()}</p>
        </div>
        <div className="flex items-center">
          <FaFrown
            className={`mr-2 hover:cursor-pointer ${!token && "pointer-events-none opacity-50"}`}
            onClick={dislikePost}
          />
          <p>{dislikeCount()}</p>
        </div>
        <div className="flex items-center hover:cursor-pointer" onClick={showCommentsHideForm}>
          <p>Comments: {commentCount()}</p>
          <FaComment className="ml-2" />
        </div>
      </div>
      {token &&
        (addComment ? (
          <FaCommentSlash className="hover:cursor-pointer" onClick={() => setAddComment(false)} />
        ) : (
          <FaCommentMedical className="hover:cursor-pointer" onClick={showFormHideComments} />
        ))}
      {viewComments && commentCount() > 0 && (
        <div>
          {commentsData?.map((el) => {
            if (el.postID === props.id) {
              const commentOwner = data?.find((arg) => arg.username === el.userID);
              const fullName = commentOwner?.firstName + " " + commentOwner?.lastName;
              return (
                <Comment
                  key={el.id}
                  id={el.id}
                  userID={el.userID}
                  fullName={fullName}
                  profilePicture={commentOwner?.profilePicture}
                  message={el.message}
                />
              );
            }
          })}
        </div>
      )}
      {addComment && token && (
        <div className="flex flex-col p-5 [&>*]:my-2 bg-gradient-to-b from-black/50 to-green-700/30 shadow-black/50 shadow-lg rounded-lg">
          <div className="flex items-center [&>*]:px-2">
            <label htmlFor="msg">Message:</label>
            <textarea
              name="msg"
              id="msg"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-black/20 shadow-md shadow-black rounded-md w-[30rem] h-[10rem] focus:outline-none p-5"
            />
          </div>
          <Button
            title={submitting ? "Submitting..." : "Submit"}
            classes={`self-center !text-[1.2rem] ${
              (!message || submitting) && "pointer-events-none opacity-50"
            }`}
            onClick={commentPost}
          />
        </div>
      )}
      {props.profile && (
        <p
          className="text-green-400 underline hover:cursor-pointer"
          onClick={() => setEditPost(true)}>
          Edit post
        </p>
      )}
      {morePics && (
        <div
          className="fixed grid md:grid-cols-2 2xl:grid-cols-3 [@media(min-width:2000px)]:grid-cols-4 gap-10 top-0 z-[1000] bg-black/80 p-10 hover:cursor-pointer w-[40rem] sm:w-full h-full"
          onClick={() => setMorePics(false)}>
          {picsData?.map((el) => {
            return (
              <img
                src={el.name}
                alt="More imgs"
                key={el.id}
                className="w-auto h-auto max-w-[30rem] max-h-[30rem] [@media(min-width:2200px)]:max-w-[25rem] [@media(min-width:2200px)]:max-h-[25rem]"
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DestinationDetail;
