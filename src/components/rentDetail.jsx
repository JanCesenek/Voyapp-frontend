import React, { useState, useEffect, useRef } from "react";
import { useUpdate } from "../hooks/use-update";
import { BsStar, BsStarFill, BsStarHalf, BsFillFileImageFill } from "react-icons/bs";
import {
  FaCalendarAlt,
  FaWalking,
  FaMapMarkerAlt,
  FaSignOutAlt,
  FaEuroSign,
  FaImages,
} from "react-icons/fa";
import { HiOutlineMail, HiOutlinePhone } from "react-icons/hi";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import { OpenStreetMapProvider, GeoSearchControl } from "leaflet-geosearch";
import "leaflet-geosearch/dist/geosearch.css";
import Loading from "./loading";
import Button from "./custom/button";
import { api } from "../core/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { v4 as uuid } from "uuid";
import moment from "moment";
import Notification from "./notification";
import { greenIcon, purpleIcon, goldIcon } from "../core/icons";

const RentDetail = (props) => {
  const lat = localStorage.getItem("lat");
  const lon = localStorage.getItem("lon");
  const curUsername = localStorage.getItem("curUser");
  const token = localStorage.getItem("token");
  const [addReservation, setAddReservation] = useState(false);
  const [addReview, setAddReview] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [people, setPeople] = useState(1);
  const [rating, setRating] = useState(3);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [editPost, setEditPost] = useState(false);
  const [morePics, setMorePics] = useState(false);
  const [name, setName] = useState(props.name);
  const [image, setImage] = useState(null);
  const [price, setPrice] = useState(props.price);
  const [description, setDescription] = useState(props.description);
  const [freeSpots, setFreeSpots] = useState(props.people);
  const [coords, setCoords] = useState([props.latitude, props.longitude]);
  const [notification, setNotification] = useState(false);
  const fileInputRef = useRef(null);
  const realStartDate =
    String(startDate).slice(8, 10) +
    " " +
    String(startDate).slice(4, 7) +
    " " +
    String(startDate).slice(11, 15);
  const realEndDate =
    String(endDate).slice(8, 10) +
    " " +
    String(endDate).slice(4, 7) +
    " " +
    String(endDate).slice(11, 15);

  const { data, isLoading } = useUpdate("/users");
  const { data: rentsData, refetch: refetchRents, isLoading: rentsLoading } = useUpdate("/rents");
  const {
    data: reservationsData,
    refetch: refetchReservations,
    isLoading: reservationsLoading,
  } = useUpdate("/rent-reservations");
  const {
    data: reviewsData,
    refetch: refetchReviews,
    isLoading: reviewsLoading,
  } = useUpdate("/reviews");
  const { data: picsData, isLoading: picsLoading } = useUpdate("/rent-pictures");
  const { data: destinationsData, isLoading: destinationsLoading } = useUpdate("/destinations");

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

  const getStars = (el) => {
    if (+el >= 4.75)
      return (
        <div className="flex justify-around">
          <BsStarFill />
          <BsStarFill />
          <BsStarFill />
          <BsStarFill />
          <BsStarFill />
        </div>
      );
    else if (+el < 4.75 && +el >= 4.25)
      return (
        <div className="flex justify-around">
          <BsStarFill />
          <BsStarFill />
          <BsStarFill />
          <BsStarFill />
          <BsStarHalf />
        </div>
      );
    else if (+el < 4.25 && +el >= 3.75)
      return (
        <div className="flex justify-around">
          <BsStarFill />
          <BsStarFill />
          <BsStarFill />
          <BsStarFill />
          <BsStar />
        </div>
      );
    else if (+el < 3.75 && +el >= 3.25)
      return (
        <div className="flex justify-around">
          <BsStarFill />
          <BsStarFill />
          <BsStarFill />
          <BsStarHalf />
          <BsStar />
        </div>
      );
    else if (+el < 3.25 && +el >= 2.75)
      return (
        <div className="flex justify-around">
          <BsStarFill />
          <BsStarFill />
          <BsStarFill />
          <BsStar />
          <BsStar />
        </div>
      );
    else if (+el < 2.75 && +el >= 2.25)
      return (
        <div className="flex justify-around">
          <BsStarFill />
          <BsStarFill />
          <BsStarHalf />
          <BsStar />
          <BsStar />
        </div>
      );
    else if (+el < 2.25 && +el >= 1.75)
      return (
        <div className="flex justify-around">
          <BsStarFill />
          <BsStarFill />
          <BsStar />
          <BsStar />
          <BsStar />
        </div>
      );
    else if (+el < 1.75 && +el >= 1.25)
      return (
        <div className="flex justify-around">
          <BsStarFill />
          <BsStarHalf />
          <BsStar />
          <BsStar />
          <BsStar />
        </div>
      );
    else if (+el < 1.25 && +el >= 0.75)
      return (
        <div className="flex justify-around">
          <BsStarFill />
          <BsStar />
          <BsStar />
          <BsStar />
          <BsStar />
        </div>
      );
    else if (+el < 0.75 && +el >= 0.25)
      return (
        <div className="flex justify-around">
          <BsStarHalf />
          <BsStar />
          <BsStar />
          <BsStar />
          <BsStar />
        </div>
      );
    else {
      return (
        <div className="flex justify-around">
          <BsStar />
          <BsStar />
          <BsStar />
          <BsStar />
          <BsStar />
        </div>
      );
    }
  };

  const onChangeDate = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  const anyReviews = reviewsData?.find((el) => el.postID === props.id);
  const alreadyReviewed = reviewsData?.find(
    (el) => el.postID === props.id && el.userID === curUsername
  );
  const anyPics = picsData?.find((el) => el.postID === props.picID);

  const picNumber = () => {
    let count = 0;
    picsData?.map((el) => {
      if (el.postID === props.picID) count++;
    });
    return count;
  };

  const getDisabledDates = () => {
    const dateArray = [];
    reservationsData?.map((el) => {
      if (el.postID === props.id) {
        let currentDate = moment(el.startDate);

        while (currentDate <= moment(el.endDate)) {
          dateArray.push(new Date(moment(currentDate).format("YYYY-MM-DD")));
          currentDate = moment(currentDate).add(1, "days");
        }
      }
    });
    return dateArray;
  };

  const unavailableDates = getDisabledDates()?.find(
    (el) => new Date(el) >= new Date(startDate) && new Date(el) <= new Date(endDate)
  );

  const isDateDisabled = (date) => {
    getDisabledDates()?.some((disabledDate) => date.toISOString().startsWith(disabledDate)) ||
      (startDate && endDate && date >= startDate && date <= endDate);
  };

  const peopleCount = () => {
    let count = 0;
    reservationsData?.map((el) => {
      if (el.postID === props.id) count += el.people;
    });
    return count;
  };
  const spotsLeft = props.people - peopleCount();

  const updatePost = async () => {
    const uniqueID = uuid();
    if (image) {
      const { data: listData } = await supabase.storage.from("traveling").list("rents");
      const curFile = listData.find((el) => props.image.includes(el.name));
      const { data: deletedData, error: deletedError } = await supabase.storage
        .from("traveling")
        .remove([`rents/${curFile.name}`]);

      if (deletedError) {
        console.log("Failed to delete profile pic...", deletedError);
      } else {
        console.log("Old profile pic deleted successfully...", deletedData);
      }
      const { data, error } = await supabase.storage
        .from("traveling")
        .upload(`rents/${uniqueID}`, image, {
          cacheControl: "3600",
          upsert: false,
        });

      const { dataGet, errorGet } = await supabase.storage.from("traveling").list("rents");

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
      price: +price,
      description,
      people: +freeSpots,
      latitude: +coords[0],
      longitude: +coords[1],
    };
    setSubmitting(true);
    await api
      .patch(`/rents/${props.id}`, patchReqPayload, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      })
      .then(async () => await refetchRents())
      .catch((err) => console.log(`Patch req - ${err}`));
    setSubmitting(false);
    setEditPost(false);
    props.showNotification();
    setTimeout(() => {
      props.hideNotification();
    }, 3000);
    props.back();
  };

  const createReservation = async () => {
    const realStartDate = new Date(startDate.getTime() + 86400000);
    const realEndDate = new Date(endDate.getTime() + 86400000);
    const postReqPayload = {
      userID: curUsername,
      postID: props.id,
      people: +people,
      startDate: realStartDate,
      endDate: realEndDate,
    };
    setSubmitting(true);
    await api
      .post("/rent-reservations", postReqPayload, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      })
      .then(async () => await refetchReservations())
      .catch((err) => console.log(`Post req - ${err}`));
    setAddReservation(false);
    setStartDate(null);
    setEndDate(null);
    setSubmitting(false);
    setNotification(true);
    setTimeout(() => {
      setNotification(false);
    }, 3000);
  };

  const reviewCount = () => {
    let count = 0;
    reviewsData?.map((el) => {
      if (el.postID === props.id) count++;
    });
    return count;
  };

  const createReview = async () => {
    const postReqPayload = {
      userID: curUsername,
      postID: props.id,
      rating: +rating,
      message,
    };

    setSubmitting(true);
    await api
      .post("/reviews", postReqPayload, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      })
      .then(async () => await refetchReviews())
      .catch((err) => console.log(`Post req - ${err}`));
    setAddReview(false);
    setSubmitting(false);
  };

  const loading =
    isLoading || rentsLoading || reservationsLoading || reviewsLoading || destinationsLoading;
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
          onChange={(e) => setImage(e.target.files[0])}
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
        <label htmlFor="price" className="min-w-[7rem]">
          Price/night (€):
        </label>
        <input
          type="number"
          name="price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          id="price"
          className="bg-transparent border border-white rounded-md"
        />
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
        <label htmlFor="freeSpots" className="min-w-[7rem]">
          People:
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
          {rentsData?.map((el) => {
            return (
              <Marker key={el.id} position={[el.latitude, el.longitude]} icon={purpleIcon}>
                <Popup>{el.name}</Popup>
              </Marker>
            );
          })}
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
    <div className="relative flex flex-col items-center bg-gradient-to-b from-black/70 to-green-700/50 shadow-black/50 shadow-xl rounded-md p-5 my-20 [&>*]:my-2">
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
            <FaWalking className="mr-2" />
            <p>
              {props.people} {props.people > 1 ? "people" : "person"}{" "}
            </p>
          </div>
          <div className="flex items-center">
            <FaEuroSign className="mr-2" />
            <p>{props.price} / night</p>
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
            {rentsData?.map((el) => {
              return (
                <Marker key={el.id} position={[el.latitude, el.longitude]} icon={purpleIcon}>
                  <Popup>{el.name}</Popup>
                </Marker>
              );
            })}
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
      <p className="max-w-[40rem]">{props.description}</p>
      {props.userID !== curUsername && curUsername && token && !addReview && (
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
          <div className="flex items-center">
            {endDate ? (
              <input
                type="text"
                value={`${realStartDate} - ${realEndDate}`}
                className="bg-transparent border border-white rounded-lg px-2"
                readOnly
                onClick={() => {
                  setStartDate(null);
                  setEndDate(null);
                }}
              />
            ) : (
              <DatePicker
                onChange={onChangeDate}
                minDate={new Date()}
                startDate={startDate}
                endDate={endDate}
                dayClassName={(date) => (isDateDisabled(date) ? "disabled" : null)}
                excludeDates={getDisabledDates()?.map((el) => el)}
                selectsRange
                excludeOutOfBoundsTimes
                disabledKeyboardNavigation
                inline
              />
            )}
          </div>
          <Button
            title={submitting ? "Submitting..." : "Submit"}
            classes={`${
              (people < 1 || !startDate || !endDate || unavailableDates || submitting) &&
              "pointer-events-none opacity-50"
            } text-[1rem] self-center`}
            onClick={createReservation}
          />
        </div>
      )}
      {props.userID !== curUsername &&
        curUsername &&
        !alreadyReviewed &&
        token &&
        !addReservation && (
          <p
            className="text-green-400 underline hover:cursor-pointer"
            onClick={() => setAddReview(!addReview)}>
            {addReview ? "Hide" : "Make a review"}
          </p>
        )}
      {addReview && (
        <div className="flex flex-col [&>*]:my-2 p-5 bg-gradient-to-b from-black/50 to-green-500/30 shadow-black/50 shadow-lg rounded-lg">
          <div className="flex items-center">
            <label htmlFor="rating" className="min-w-[5rem]">
              Rating:
            </label>
            <input
              type="number"
              name="rating"
              id="rating"
              className="bg-transparent border border-white rounded-md"
              min="1"
              max="5"
              step="0.5"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            />
          </div>
          <div className="flex items-center">
            <label htmlFor="msg" className="min-w-[5rem]">
              Message:
            </label>
            <textarea
              name="msg"
              id="msg"
              className="bg-transparent rounded-md border border-white w-[15rem] h-[5rem]"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <Button
            title={submitting ? "Submitting..." : "Submit"}
            classes={`self-center !text-[1rem] ${
              (!message || submitting) && "pointer-events-none opacity-50"
            }`}
            onClick={createReview}
          />
        </div>
      )}
      <div className="flex w-4/5 items-center justify-around !my-10">
        {anyReviews ? (
          <div className="flex items-center">
            <span>{getStars(props.avgRating)}</span>
            <span className="mx-2">({props.avgRating})</span>
            <span
              className="text-green-400 underline hover:cursor-pointer"
              onClick={() => setShowReviews(!showReviews)}>
              {reviewCount()} {reviewCount() > 1 ? "reviews" : "review"}
            </span>
          </div>
        ) : (
          <div>No reviews yet!</div>
        )}
      </div>
      {showReviews &&
        reviewsData?.map((el) => {
          const reviewer = data?.find(
            (arg) => arg.username === el.userID && el.postID === props.id
          );
          const fullName = reviewer?.firstName + " " + reviewer?.lastName;
          if (el.postID === props.id)
            return (
              <div
                key={el.id}
                className="flex flex-col w-[25rem] items-center bg-gradient-to-b from-black/50 to-green-700/50 shadow-black/50 shadow-md rounded-lg p-5 !mb-5">
                <div className="flex items-center [&>*]:mx-5 border-b pb-2 border-green-600">
                  <div className="flex items-center text-[0.8rem] w-max">
                    <span className="text-green-400">{fullName}</span>
                    <img
                      src={reviewer?.profilePicture}
                      alt="profile pic"
                      className="w-auto h-auto max-w-[2rem] max-h-[2rem] ml-2 rounded-md"
                    />
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">{getStars(el.rating)}</span>
                    <span>({el.rating})</span>
                  </div>
                </div>
                <div className="mt-2">{el.message}</div>
              </div>
            );
        })}
      {props.profile && (
        <p
          className="text-green-400 underline hover:cursor-pointer"
          onClick={() => setEditPost(true)}>
          Edit post
        </p>
      )}
      {notification && <Notification className="top-[-4rem]" message="Reserved!" post />}
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
                className="w-auto h-auto max-w-[30rem] max-h-[30rem] [@media(min-width:2200px)]:max-w-[20rem] [@media(min-width:2200px)]:max-h-[20rem]"
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RentDetail;
