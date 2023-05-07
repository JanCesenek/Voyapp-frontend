import React, { useState, useEffect, useRef } from "react";
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
} from "react-icons/fa";
import { HiOutlineMail, HiOutlinePhone } from "react-icons/hi";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import { OpenStreetMapProvider, GeoSearchControl } from "leaflet-geosearch";
import "leaflet-geosearch/dist/geosearch.css";
import Loading from "./loading";
import Comment from "./comment";
import Button from "./custom/button";
import { api } from "../core/api";
import { createClient } from "@supabase/supabase-js";
import { supStorageURL, supStorageKEY } from "../core/supabaseStorage";
import { v4 as uuid } from "uuid";
import Notification from "./notification";
import { greenIcon, goldIcon } from "../core/icons";

const DestinationDetail = (props) => {
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
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState(props.name);
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState(props.description);
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [freeSpots, setFreeSpots] = useState(props.freeSpots);
  const [coords, setCoords] = useState([props.latitude, props.longitude]);
  const [notification, setNotification] = useState(false);
  const fileInputRef = useRef(null);

  const supabase = createClient(supStorageURL, supStorageKEY);

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
        setAccCoords([center.lat, center.lng]);
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
        alert(
          "Could not upload the file. A file with the same name most likely already exists. Try to rename the file and see if the issues persists!"
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
      .then(async () => await refetchDestinations())
      .catch((err) => console.log(`Patch req - ${err}`));
    setSubmitting(false);
    setEditPost(false);
    props.showNotification();
    setTimeout(() => {
      props.hideNotification();
    }, 3000);
    props.back();
  };

  const likePost = async () => {
    const alreadyLiked = likesData?.find(
      (el) => el.postID === props.id && el.userID === curUsername
    );
    const alreadyDisliked = dislikesData?.find(
      (el) => el.postID === props.id && el.userID === curUsername
    );

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
  };

  const dislikePost = async () => {
    const alreadyLiked = likesData?.find(
      (el) => el.postID === props.id && el.userID === curUsername
    );
    const alreadyDisliked = dislikesData?.find(
      (el) => el.postID === props.id && el.userID === curUsername
    );

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
  };

  const commentPost = async () => {
    const postReqPayload = {
      userID: curUsername,
      postID: props.id,
      message,
    };

    await api
      .post("/comments", postReqPayload, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      })
      .then(async () => await refetchComments())
      .catch((err) => console.log(`Post req - ${err}`));
    setMessage("");
    setAddComment(false);
  };

  const anyReservations = reservationsData?.find((el) => el.postID === props.id);

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
    await api
      .post("/destination-reservations", postReqPayload, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      })
      .then(async () => await refetchReservations())
      .catch((err) => console.log(`Post req - ${err}`));
    setAddReservation(false);
    setNotification(true);
    setTimeout(() => {
      setNotification(false);
    }, 3000);
  };

  const loading =
    isLoading ||
    likesLoading ||
    dislikesLoading ||
    commentsLoading ||
    destinationsLoading ||
    reservationsLoading;
  if (loading) return <Loading />;

  return editPost ? (
    <div className="flex relative flex-col [&>*]:my-2 bg-gradient-to-b from-black/50 to-green-500/30 shadow-black/50 shadow-xl rounded-lg p-5 !w-full">
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
          className="bg-transparent border border-white rounded-md"
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
          className="bg-transparent border border-white rounded-md w-[15rem] h-[7rem]"
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
          className="bg-transparent border border-white rounded-md"
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
          className="bg-transparent border border-white rounded-md"
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
          className="bg-transparent border border-white rounded-md"
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
    <div className="relative flex flex-col items-center bg-gradient-to-b from-black/50 to-green-700/50 shadow-black/50 shadow-xl rounded-md p-5 my-20 [&>*]:my-2">
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
          <img
            src={props.image}
            alt="some img"
            className="w-auto h-auto max-w-[20rem] max-h-[20rem] rounded-lg"
          />
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
        <div className="my-5 flex flex-col [&>*]:my-2">
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
            title="Submit"
            classes={`${
              (people > spotsLeft || people < 1) && "pointer-events-none opacity-50"
            } text-[0.7rem] self-center`}
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
        <div
          className="flex items-center hover:cursor-pointer"
          onClick={() => setViewComments(!viewComments)}>
          <p>Comments: {commentCount()}</p>
          <FaComment className="ml-2" />
        </div>
      </div>
      {token &&
        (addComment ? (
          <FaCommentSlash className="hover:cursor-pointer" onClick={() => setAddComment(false)} />
        ) : (
          <FaCommentMedical className="hover:cursor-pointer" onClick={() => setAddComment(true)} />
        ))}
      {viewComments && commentCount() > 0 && (
        <div className="mt-2 border-t border-green-600">
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
          <div className="flex items-center">
            <label htmlFor="msg">Message:</label>
            <textarea
              name="msg"
              id="msg"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-transparent border border-white rounded-md w-[20rem] h-[5rem]"
            />
          </div>
          <Button
            title="Submit"
            classes={`self-center !text-[1.2rem] ${!message && "pointer-events-none opacity-50"}`}
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
      {notification && <Notification className="top-[-4rem]" message="Reserved!" post />}
    </div>
  );
};

export default DestinationDetail;
