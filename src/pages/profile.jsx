import React, { useState, useEffect, useRef } from "react";
import { useUpdate } from "../hooks/use-update";
import Loading from "../components/loading";
import { AiFillCloseCircle } from "react-icons/ai";
import { BsFillFileImageFill } from "react-icons/bs";
import {
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlinePencil,
  HiOutlineX,
  HiCheck,
} from "react-icons/hi";
import { api } from "../core/api";
import Button from "../components/custom/button";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { OpenStreetMapProvider, GeoSearchControl } from "leaflet-geosearch";
import "leaflet-geosearch/dist/geosearch.css";
import "leaflet/dist/leaflet.css";
import { createClient } from "@supabase/supabase-js";
import { supStorageURL, supStorageKEY } from "../core/supabaseStorage";
import { v4 as uuid } from "uuid";
import Notification from "../components/notification";
import Destinations from "./destinations";
import Accommodation from "./accommodation";
import { FaWindowClose } from "react-icons/fa";
import { greenIcon, goldIcon, purpleIcon } from "../core/icons";

const Profile = () => {
  const curUsername = localStorage.getItem("curUser");
  const token = localStorage.getItem("token");
  const lat = localStorage.getItem("lat");
  const lon = localStorage.getItem("lon");
  const { data, refetch, isLoading } = useUpdate("/users");
  const {
    data: destinationsData,
    refetch: refetchDestinations,
    isLoading: destinationsLoading,
  } = useUpdate("/destinations");
  const {
    data: destinationReservationsData,
    refetch: refetchDestinationReservations,
    isLoading: destinationReservationsLoading,
  } = useUpdate("/destination-reservations");
  const { data: rentsData, refetch: refetchRents, isLoading: rentsLoading } = useUpdate("/rents");
  const {
    data: rentReservationsData,
    refetch: refetchRentReservations,
    isLoading: rentReservationsLoading,
  } = useUpdate("/rent-reservations");
  const {
    data: notificationsData,
    refetch: refetchNotifications,
    isLoading: notificationsLoading,
  } = useUpdate("/notifications");
  const curUser = data?.find((el) => el.username === curUsername);
  const [changeEmail, setChangeEmail] = useState(false);
  const [changePhone, setChangePhone] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [coords, setCoords] = useState([+lat, +lon]);
  const [addDestination, setAddDestination] = useState(false);
  const [addAccommodation, setAddAccommodation] = useState(false);
  const [destName, setDestName] = useState("");
  const [destImage, setDestImage] = useState("");
  const [destDescription, setDestDescription] = useState("");
  const [destStartDate, setDestStartDate] = useState("");
  const [destEndDate, setDestEndDate] = useState("");
  const [destFreeSpots, setDestFreeSpots] = useState(1);
  const [accName, setAccName] = useState("");
  const [accImage, setAccImage] = useState("");
  const [accPrice, setAccPrice] = useState(5);
  const [accDescription, setAccDescription] = useState("");
  const [accPeople, setAccPeople] = useState(1);
  const [accCoords, setAccCoords] = useState([+lat, +lon]);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(false);
  const [viewData, setViewData] = useState(false);
  const [viewDestinations, setViewDestinations] = useState(false);
  const [viewAccommodation, setViewAccommodation] = useState(false);
  const [viewDestReservations, setViewDestReservations] = useState(false);
  const [viewAccReservations, setViewAccReservations] = useState(false);
  const [changePic, setChangePic] = useState(false);
  const [editedPic, setEditedPic] = useState(null);
  const fileInputRef = useRef(null);
  const accFileInputRef = useRef(null);
  const inputValueRef = useRef(null);
  const malePic =
    "https://cxfluuggeeoujjwckzuu.supabase.co/storage/v1/object/public/traveling/userPics/Default1.png";
  const femalePic =
    "https://cxfluuggeeoujjwckzuu.supabase.co/storage/v1/object/public/traveling/userPics/Default6.png";
  const defaultPic = curUser?.gender === "M" ? malePic : femalePic;
  const uniqueID = uuid();

  const supabase = createClient(supStorageURL, supStorageKEY);

  useEffect(() => {
    return () => {
      if (editedPic) {
        URL.revokeObjectURL(editedPic.preview);
      }
    };
  }, [editedPic]);

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
    setDestImage(e.target.files[0]);
  };

  const handleProfilePic = (e) => {
    console.log(e.target.files[0]);
    setEditedPic(e.target.files[0]);
  };

  const editDetails = async (el, pic) => {
    if (pic) {
      if (curUser?.profilePicture !== malePic && curUser?.profilePicture !== femalePic) {
        const { data } = await supabase.storage.from("traveling").list("userPics");
        const curFile = data.find((el) => curUser?.profilePicture.includes(el.name));
        const { data: deletedData, error: deletedError } = await supabase.storage
          .from("traveling")
          .remove([`userPics/${curFile.name}`]);

        if (deletedError) {
          console.log("Failed to delete profile pic...", deletedError);
        } else {
          console.log("Old profile pic deleted successfully...", deletedData);
        }
      }
      const { data, error } = await supabase.storage
        .from("traveling")
        .upload(`userPics/${uniqueID}`, editedPic, {
          cacheControl: "3600",
          upsert: false,
        });

      const { dataGet, errorGet } = await supabase.storage.from("traveling").list("userPics");

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
    await api
      .patch(`/users/${curUsername}`, el, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then(async () => await refetch())
      .catch((err) => console.log(`Patch req - ${err}`));
    setChangeEmail(false);
    setChangePhone(false);
  };

  const resetDestinationData = () => {
    setDestName("");
    setDestDescription("");
    setDestStartDate("");
    setDestEndDate("");
    setDestFreeSpots(1);
    fileInputRef.current.value = null;
    setDestImage(null);
  };

  const resetAccommodationData = () => {
    setAccName("");
    setAccPrice(1);
    setAccDescription("");
    setAccPeople("");
    accFileInputRef.current.value = null;
    setAccImage(null);
  };

  const createDestination = async () => {
    const uniqueID = uuid();

    const handleUpload = async () => {
      const { data, error } = await supabase.storage
        .from("traveling")
        .upload(`destinations/${uniqueID}`, destImage, {
          cacheControl: "3600",
          upsert: false,
        });

      const { data: dataGet, error: errorGet } = await supabase.storage
        .from("traveling")
        .list("destinations");

      if (error) {
        console.log("Error uploading file...", error);
      } else {
        console.log("File uploaded!", data.path);
      }

      if (errorGet) {
        console.log("Error listing files...", error);
      } else {
        console.log("Files listed!", dataGet);
      }
    };
    await handleUpload();

    const postReqPayload = {
      userID: curUsername,
      name: destName,
      image: `https://cxfluuggeeoujjwckzuu.supabase.co/storage/v1/object/public/traveling/destinations/${uniqueID}`,
      startDate: new Date(destStartDate),
      endDate: new Date(destEndDate),
      description: destDescription,
      freeSpots: +destFreeSpots,
      latitude: +coords[0],
      longitude: +coords[1],
    };

    setSubmitting(true);
    await api
      .post("/destinations", postReqPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then(async () => await refetchDestinations())
      .catch((err) => console.log(`Post req err - ${err}`));
    setSubmitting(false);

    resetDestinationData();
    setAddDestination(false);
    setNotification(true);
    setTimeout(() => {
      setNotification(false);
    }, 3000);
  };

  const createAccommodation = async () => {
    const uniqueID = uuid();

    const handleUpload = async () => {
      const { data, error } = await supabase.storage
        .from("traveling")
        .upload(`rents/${uniqueID}`, accImage, {
          cacheControl: "3600",
          upsert: false,
        });

      const { data: dataGet, error: errorGet } = await supabase.storage
        .from("traveling")
        .list("rents");

      if (error) {
        console.log("Error uploading file...", error);
      } else {
        console.log("File uploaded!", data.path);
      }

      if (errorGet) {
        console.log("Error listing files...", error);
      } else {
        console.log("Files listed!", dataGet);
      }
    };
    await handleUpload();

    const postReqPayload = {
      userID: curUsername,
      name: accName,
      image: `https://cxfluuggeeoujjwckzuu.supabase.co/storage/v1/object/public/traveling/rents/${uniqueID}`,
      price: +accPrice,
      description: accDescription,
      people: +accPeople,
      latitude: +accCoords[0],
      longitude: +accCoords[1],
    };

    setSubmitting(true);
    await api
      .post("/rents", postReqPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then(async () => await refetchRents())
      .catch((err) => console.log(`Post req err - ${err}`));
    setSubmitting(false);

    resetAccommodationData();
    setAddAccommodation(false);
    setNotification(true);
    setTimeout(() => {
      setNotification(false);
    }, 3000);
  };

  const deleteDestReservation = async (id) => {
    if (window.confirm("Really wanna cancel the reservation?")) {
      await api
        .delete(`/destination-reservations/${id}`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        })
        .then(async () => await refetchDestinationReservations())
        .catch((err) => console.log(`Delete req - ${err}`));
    }
  };

  const deleteAccReservation = async (id) => {
    if (window.confirm("Really wanna cancel the reservation?")) {
      await api
        .delete(`/rent-reservations/${id}`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        })
        .then(async () => await refetchRentReservations())
        .catch((err) => console.log(`Delete req - ${err}`));
    }
  };

  const deleteNotification = async (id) => {
    await api
      .delete(`/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      })
      .then(async () => await refetchNotifications())
      .catch((err) => console.log(`Delete req - ${err}`));
  };

  const anyNotifications = notificationsData?.find((el) => el.recipient === curUsername);

  const anyDestinations = destinationsData?.find((el) => el.userID === curUsername);
  const destinations = [];
  destinationsData?.forEach((el) => {
    if (el.userID === curUsername) destinations.push(el.id);
  });
  const anyDestinationReservations = destinationReservationsData?.find(
    (el) => el.userID === curUsername || destinations.includes(el.postID)
  );
  const anyRents = rentsData?.find((el) => el.userID === curUsername);
  const rents = [];
  rentsData?.forEach((el) => {
    if (el.userID === curUsername) rents.push(el.id);
  });
  const anyRentReservations = rentReservationsData?.find(
    (el) => el.userID === curUsername || rents.includes(el.postID)
  );
  const anyData = anyDestinations || anyDestinationReservations || anyRents || anyRentReservations;

  const validDestinationData =
    destName &&
    destImage &&
    destDescription &&
    destStartDate &&
    destEndDate &&
    destFreeSpots &&
    Date(destStartDate) <= Date(destEndDate);

  const validAccommodationData = accName && accImage && accDescription && accPeople;

  const loading =
    isLoading ||
    destinationsLoading ||
    rentsLoading ||
    destinationReservationsLoading ||
    rentReservationsLoading ||
    notificationsLoading;
  if (loading) return <Loading />;

  return curUsername ? (
    <div className="flex flex-col [&>*]:my-2 items-center [&>*]:w-3/5 min-w-[30rem] mt-20 bg-gradient-to-b from-black/5 via-black/70 to-black/5 rounded-lg p-5">
      <div className="flex justify-center items-center text-[2rem] mx-5 !w-full border-b border-white pb-5">
        <div>
          <img
            src={curUser?.profilePicture}
            alt="some img"
            className="w-auto h-auto max-w-[10rem] max-h-[10rem] mr-5 rounded-lg hover:cursor-pointer"
            onClick={() => setChangePic(!changePic)}
          />
          {changePic && (
            <div className="flex mt-2 bg-black bg-opacity-30">
              <label htmlFor="pic" className="flex w-[10rem] text-[0.7rem] hover:cursor-pointer">
                <BsFillFileImageFill /> Upload image {editedPic && "uploaded img"}
              </label>
              <input
                type="file"
                name="pic"
                id="pic"
                size="10"
                className="hidden"
                onChange={handleProfilePic}
                ref={inputValueRef}
              />
              {editedPic && (
                <AiFillCloseCircle
                  className="w-3 h-3 hover:cursor-pointer mr-2"
                  onClick={() => {
                    inputValueRef.current.value = null;
                    setEditedPic(false);
                  }}
                />
              )}
              <HiOutlinePencil
                className="w-3 h-3 hover:cursor-pointer"
                onClick={() => {
                  editDetails(
                    {
                      profilePicture: editedPic
                        ? `https://cxfluuggeeoujjwckzuu.supabase.co/storage/v1/object/public/traveling/userPics/${uniqueID}`
                        : defaultPic,
                    },
                    true
                  );
                  inputValueRef.current.value = null;
                  setEditedPic(null);
                  setChangePic(false);
                }}
              />
            </div>
          )}
        </div>
        <div className="flex">
          {curUser?.firstName} {curUser?.lastName}
        </div>
      </div>
      {changeEmail ? (
        <div className="flex items-center">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-transparent border border-white rounded-md"
          />
          <HiCheck className="hover:cursor-pointer" onClick={() => editDetails({ email })} />
          <HiOutlineX className="hover:cursor-pointer" onClick={() => setChangeEmail(false)} />
        </div>
      ) : (
        <div className="flex items-center">
          <HiOutlineMail />
          <span className="ml-10 hover:cursor-pointer" onClick={() => setChangeEmail(true)}>
            {curUser?.email}
          </span>
        </div>
      )}
      {changePhone ? (
        <div className="flex items-center">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="bg-transparent border border-white rounded-md"
          />
          <HiCheck className="hover:cursor-pointer" onClick={() => editDetails({ phone })} />
          <HiOutlineX className="hover:cursor-pointer" onClick={() => setChangePhone(false)} />
        </div>
      ) : (
        <div className="flex items-center">
          <HiOutlinePhone />
          <span className="ml-10 hover:cursor-pointer" onClick={() => setChangePhone(true)}>
            {curUser?.phone}
          </span>
        </div>
      )}
      {anyNotifications && (
        <div className="my-10">
          {notificationsData?.map((el) => {
            if (el.recipient === curUsername) {
              return (
                <Notification
                  key={el.id}
                  message={el.message}
                  post={el.new ? true : false}
                  delete={el.new ? false : true}
                  className="!static my-2 hover:cursor-pointer text-[1rem]"
                  onClick={() => deleteNotification(el.id)}
                />
              );
            }
          })}
        </div>
      )}
      {!addAccommodation && !viewData && (
        <p
          className="text-green-400 underline hover:cursor-pointer !w-auto self-center"
          onClick={() => {
            setAddDestination(!addDestination);
          }}>
          {addDestination ? "Hide" : "Add new destination"}
        </p>
      )}
      {addDestination && (
        <div className="flex flex-col [&>*]:my-2 bg-gradient-to-b from-black/50 to-green-500/30 shadow-black/50 shadow-lg rounded-lg p-5 !w-full">
          <div className="flex items-center">
            <label htmlFor="name" className="min-w-[7rem]">
              Name:
            </label>
            <input
              type="text"
              id="name"
              className="bg-transparent border border-white rounded-md"
              value={destName}
              onChange={(e) => setDestName(e.target.value)}
            />
          </div>
          <div className="flex items-center">
            <p className="min-w-[7rem]">Image:</p>
            <label htmlFor="pic" className="flex w-[15rem] text-[1rem] ml-5 hover:cursor-pointer">
              <BsFillFileImageFill /> {destImage ? destImage.name : "Upload image"}
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
            {destImage && (
              <AiFillCloseCircle
                className="w-3 h-3 hover:cursor-pointer mr-2"
                onClick={() => {
                  fileInputRef.current.value = null;
                  setDestImage(null);
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
              value={destDescription}
              onChange={(e) => setDestDescription(e.target.value)}
            />
          </div>
          <div className="flex items-center">
            <label htmlFor="startDate" className="min-w-[7rem]">
              Start date:
            </label>
            <input
              type="date"
              name="startDate"
              value={destStartDate}
              onChange={(e) => setDestStartDate(e.target.value)}
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
              value={destEndDate}
              onChange={(e) => setDestEndDate(e.target.value)}
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
              value={destFreeSpots}
              onChange={(e) => setDestFreeSpots(e.target.value)}
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
            classes={`self-center text-[1rem] ${
              (!validDestinationData || submitting) && "pointer-events-none opacity-50"
            }`}
            onClick={createDestination}
          />
        </div>
      )}
      {!addDestination && !viewData && (
        <p
          className="text-green-400 underline hover:cursor-pointer !w-auto self-center"
          onClick={() => {
            setAddAccommodation(!addAccommodation);
          }}>
          {addAccommodation ? "Hide" : "Add new accommodation"}
        </p>
      )}
      {addAccommodation && (
        <div className="flex flex-col [&>*]:my-2 bg-gradient-to-b from-black/50 to-green-500/30 shadow-black/50 shadow-lg rounded-lg p-5 !w-[85%] sm:!w-full">
          <div className="flex items-center">
            <label htmlFor="name" className="min-w-[7rem]">
              Name:
            </label>
            <input
              type="text"
              id="name"
              className="bg-transparent border border-white rounded-md"
              value={accName}
              onChange={(e) => setAccName(e.target.value)}
            />
          </div>
          <div className="flex items-center">
            <p className="min-w-[7rem]">Image:</p>
            <label htmlFor="pic" className="flex w-[15rem] text-[1rem] ml-5 hover:cursor-pointer">
              <BsFillFileImageFill /> {accImage ? accImage.name : "Upload image"}
            </label>
            <input
              type="file"
              name="pic"
              id="pic"
              size="10"
              className="hidden"
              accept="image/*"
              onChange={(e) => setAccImage(e.target.files[0])}
              ref={accFileInputRef}
            />
            {accImage && (
              <AiFillCloseCircle
                className="w-3 h-3 hover:cursor-pointer mr-2"
                onClick={() => {
                  accFileInputRef.current.value = null;
                  setAccImage(null);
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
              value={accPrice}
              onChange={(e) => setAccPrice(e.target.value)}
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
              value={accDescription}
              onChange={(e) => setAccDescription(e.target.value)}
            />
          </div>
          <div className="flex items-center">
            <label htmlFor="freeSpots" className="min-w-[7rem]">
              People:
            </label>
            <input
              type="number"
              name="freeSpots"
              value={accPeople}
              onChange={(e) => setAccPeople(e.target.value)}
              id="freeSpots"
              className="bg-transparent border border-white rounded-md"
            />
          </div>
          <div className="flex items-center">
            <div className="min-w-[7rem]">Location:</div>
            <MapContainer
              className="!w-[20rem] !h-[10rem] sm:!w-[30rem] sm:!h-[15rem] !text-black rounded-lg"
              center={accCoords}
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
              <Marker position={accCoords} icon={greenIcon}>
                <Popup>Default marker - controllable. This location will be saved.</Popup>
              </Marker>
            </MapContainer>
          </div>
          <Button
            title={submitting ? "Submitting..." : "Submit"}
            classes={`self-center text-[1rem] ${
              (!validAccommodationData || submitting) && "pointer-events-none opacity-50"
            }`}
            onClick={createAccommodation}
          />
        </div>
      )}
      {anyData && !addAccommodation && !addDestination && (
        <p
          className="text-green-400 underline hover:cursor-pointer !w-auto self-center text-[1.5rem]"
          onClick={() => {
            setViewData(!viewData);
            setViewDestinations(false);
            setViewAccommodation(false);
            setViewDestReservations(false);
            setViewAccReservations(false);
          }}>
          {viewData ? "Hide data" : "View data"}
        </p>
      )}
      {viewData && (
        <div className="flex flex-col [&>*]:my-5 !w-full p-5">
          {!viewAccommodation &&
            !viewDestReservations &&
            !viewAccReservations &&
            anyDestinations && (
              <p
                className="text-green-200 underline hover:cursor-pointer self-center"
                onClick={() => setViewDestinations(!viewDestinations)}>
                Your destinations
              </p>
            )}
          {!viewDestinations && !viewDestReservations && !viewAccReservations && anyRents && (
            <p
              className="text-green-200 underline hover:cursor-pointer self-center"
              onClick={() => setViewAccommodation(!viewAccommodation)}>
              Your accommodation
            </p>
          )}
          {!viewAccommodation &&
            !viewDestinations &&
            !viewAccReservations &&
            anyDestinationReservations && (
              <p
                className="text-green-200 underline hover:cursor-pointer self-center"
                onClick={() => setViewDestReservations(!viewDestReservations)}>
                Your destination reservations
              </p>
            )}
          {!viewAccommodation &&
            !viewDestReservations &&
            !viewDestinations &&
            anyRentReservations && (
              <p
                className="text-green-200 underline hover:cursor-pointer self-center"
                onClick={() => setViewAccReservations(!viewAccReservations)}>
                Your accommodation reservations
              </p>
            )}
          {anyDestinations && viewDestinations && <Destinations profile />}
          {anyRents && viewAccommodation && <Accommodation profile />}
          {anyDestinationReservations && viewDestReservations && (
            <div className="grid grid-cols-5 [&>*]:gap-x-10 justify-items-center items-center">
              <div className="col-span-full grid md:grid-cols-5 sm:grid-cols-4 grid-cols-3 justify-items-center w-full mb-2">
                <p className="text-green-400 text-[1.5rem] underline">Name</p>
                <p className="text-green-400 text-[1.5rem] underline">Reserved by</p>
                <p className="hidden md:block text-green-400 text-[1.5rem] underline">Date range</p>
                <p className="hidden sm:block text-green-400 text-[1.5rem] underline">People</p>
                <p className="text-green-400 text-[1.5rem] underline">Trip guide</p>
              </div>
              {destinationReservationsData?.map((el) => {
                const destination = destinationsData?.find((arg) => arg.id === el.postID);
                const reservationOwner = data?.find((arg) => arg.username === el.userID);
                const postOwner = data?.find((arg) => arg.username === destination?.userID);
                const fullName = postOwner?.firstName + " " + postOwner?.lastName;
                const reservationOwnerFullName =
                  reservationOwner?.firstName + " " + reservationOwner?.lastName;
                const startDate =
                  destination?.startDate.slice(8, 10) +
                  "/" +
                  destination?.startDate.slice(5, 7) +
                  "/" +
                  destination?.startDate.slice(0, 4);
                const endDate =
                  destination?.endDate.slice(8, 10) +
                  "/" +
                  destination?.endDate.slice(5, 7) +
                  "/" +
                  destination?.endDate.slice(0, 4);
                const dateRange = startDate + " - " + endDate;

                if (
                  el.userID === curUsername ||
                  (el.postID === destination?.id && destination?.userID === curUsername)
                ) {
                  return (
                    <div
                      key={el.id}
                      className={`col-span-full grid md:grid-cols-5 sm:grid-cols-4 grid-cols-3 justify-items-center w-full bg-gradient-to-r from-black/50 to-black/50 ${
                        el.userID === curUsername ? "via-green-400/50" : "via-green-700/50"
                      }`}>
                      <p>{destination?.name}</p>
                      <p>{reservationOwnerFullName}</p>
                      <p className="hidden md:block">{dateRange}</p>
                      <p className="hidden sm:block">{el.people}</p>
                      <p className="flex items-center [&>*]:mx-2">
                        <span>{fullName}</span>{" "}
                        <FaWindowClose
                          className="hover:cursor-pointer"
                          onClick={() => deleteDestReservation(el.id)}
                        />
                      </p>
                    </div>
                  );
                }
              })}
            </div>
          )}
          {anyRentReservations && viewAccReservations && (
            <div className="grid grid-cols-5 [&>*]:gap-x-10 justify-items-center items-center">
              <div className="col-span-full grid md:grid-cols-5 sm:grid-cols-4 grid-cols-3 justify-items-center w-full mb-2">
                <p className="text-green-400 text-[1.5rem] underline">Name</p>
                <p className="text-green-400 text-[1.5rem] underline">Reserved by</p>
                <p className="hidden md:block text-green-400 text-[1.5rem] underline">Date range</p>
                <p className="hidden sm:block text-green-400 text-[1.5rem] underline">People</p>
                <p className="text-green-400 text-[1.5rem] underline">Owner</p>
              </div>
              {rentReservationsData?.map((el) => {
                const rent = rentsData?.find((arg) => arg.id === el.postID);
                const reservationOwner = data?.find((arg) => arg.username === el.userID);
                const postOwner = data?.find((arg) => arg.username === rent?.userID);
                const fullName = postOwner?.firstName + " " + postOwner?.lastName;
                const reservationOwnerFullName =
                  reservationOwner?.firstName + " " + reservationOwner?.lastName;
                const startDate =
                  el.startDate.slice(8, 10) +
                  "/" +
                  el.startDate.slice(5, 7) +
                  "/" +
                  el.startDate.slice(0, 4);
                const endDate =
                  el.endDate.slice(8, 10) +
                  "/" +
                  el.endDate.slice(5, 7) +
                  "/" +
                  el.endDate.slice(0, 4);
                const dateRange = startDate + " - " + endDate;

                if (
                  el.userID === curUsername ||
                  (el.postID === rent?.id && rent?.userID === curUsername)
                ) {
                  return (
                    <div
                      key={el.id}
                      className={`col-span-full grid md:grid-cols-5 sm:grid-cols-4 grid-cols-3 justify-items-center w-full bg-gradient-to-r from-black/50 to-black/50 ${
                        el.userID === curUsername ? "via-green-400/50" : "via-green-700/50"
                      }`}>
                      <p>{rent?.name}</p>
                      <p>{reservationOwnerFullName}</p>
                      <p className="hidden md:block">{dateRange}</p>
                      <p className="hidden sm:block">{el.people}</p>
                      <p className="flex items-center [&>*]:mx-2">
                        <span>{fullName}</span>{" "}
                        <FaWindowClose
                          className="hover:cursor-pointer"
                          onClick={() => deleteAccReservation(el.id)}
                        />
                      </p>
                    </div>
                  );
                }
              })}
            </div>
          )}
        </div>
      )}
      {notification && <Notification message="Post created successfully!" post />}
    </div>
  ) : (
    <p className="mt-10">You need to be logged in to view your profile!</p>
  );
};

export default Profile;
