import React, { useState, useEffect, useContext } from "react";
import { useUpdate } from "../hooks/use-update";
import Loading from "../components/loading";
import Rent from "../components/rent";
import RentDetail from "../components/rentDetail";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { OpenStreetMapProvider, GeoSearchControl } from "leaflet-geosearch";
import "leaflet-geosearch/dist/geosearch.css";
import { greenIcon, purpleIcon, goldIcon } from "../core/icons";
import supabase from "../core/supabase";
import { api } from "../core/api";
import { AuthContext } from "../context/AuthContext";

const Accommodation = (props) => {
  const { notifyContext } = useContext(AuthContext);

  const lat = localStorage.getItem("lat");
  const lon = localStorage.getItem("lon");
  const curUsername = localStorage.getItem("curUser");
  const { data, isLoading, refetch } = useUpdate("/rents");
  const { data: usersData, isLoading: usersLoading } = useUpdate("/users");
  const { data: reviewsData, isLoading: reviewsLoading } = useUpdate("/reviews");
  const { data: destinationsData, isLoading: destinationsLoading } = useUpdate("/destinations");
  // if true, show a specific accommodation, else list all accommodations
  const [detail, setDetail] = useState(false);
  // state tracking if a  user wishes to add filter
  const [addFilter, setAddFilter] = useState(false);
  // states tracking values for filtering accommodation
  const [filterValue, setFilterValue] = useState("");
  const [comparisonValue, setComparisonValue] = useState("=");
  const [numberValue, setNumberValue] = useState(1);
  const [textValue, setTextValue] = useState("");
  const [coords, setCoords] = useState([+lat, +lon]);

  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("token");

  // Search component necessary for creating a search field in Leaflet map allowing user to search for any location all around the world
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

  const countDistance = (latitude, longitude) => {
    const deg2rad = (deg) => {
      return deg * (Math.PI / 180);
    };
    const R = 6371;
    const dLat = deg2rad(latitude - coords[0]);
    const dLon = deg2rad(longitude - coords[1]);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(coords[0])) *
        Math.cos(deg2rad(latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d.toFixed(1);
  };

  const getRating = (arg) => {
    let count = 0;
    const ratings = [];
    reviewsData?.map((el) => {
      if (el.postID === arg.id) ratings.push(+el.rating);
    });
    ratings.forEach((el) => (count += el));
    count = count / ratings.length;
    return parseFloat(count.toFixed(2));
  };

  const deletePost = async (id, image) => {
    if (window.confirm("Really wanna delete the post?")) {
      const { data: presentData } = await supabase.storage.from("traveling").list("rents");
      const curFile = presentData.find((el) => image.includes(el.name));
      console.log(curFile);
      const { data, error } = await supabase.storage
        .from("traveling")
        .remove([`rents/${curFile.name}`]);

      if (error) {
        console.log("Error deleting file", error);
      } else {
        console.log("File successfully deleted!", data);
      }

      setSubmitting(true);
      await api
        .delete(`/rents/${id}`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        })
        .then(async () => {
          await refetch();
          notifyContext("Post deleted successfully!", "success");
        })
        .catch((err) => {
          console.log(`Delete req - ${err}`);
          notifyContext("Error deleting post! Try again...", "error");
        })
        .finally(() => {
          setSubmitting(false);
        });
    }
  };

  const loading = isLoading || usersLoading || reviewsLoading || destinationsLoading;
  if (loading) return <Loading />;

  return detail ? (
    <RentDetail
      id={detail?.id}
      userID={detail?.userID}
      name={detail?.name}
      price={detail?.price}
      description={detail?.description}
      people={detail?.people}
      image={detail?.image}
      latitude={detail?.latitude}
      longitude={detail?.longitude}
      picID={detail?.picID}
      profile={props.profile}
      distance={countDistance(detail?.latitude, detail?.longitude)}
      avgRating={getRating(detail)}
      back={() => setDetail(false)}
    />
  ) : (
    <div
      className={`flex flex-col items-center ${
        submitting && "cursor-not-allowed opacity-70 pointer-events-none"
      }`}>
      {!props.profile && (
        <p
          className="text-green-400 mt-10 underline hover:cursor-pointer"
          onClick={() => setAddFilter(!addFilter)}>
          {addFilter ? "Hide filter" : "Add filter"}
        </p>
      )}
      {/* FILTER */}
      {addFilter && (
        <div className="flex flex-col items-center mb-10 mt-5 bg-gradient-to-b from-black/70 to-green-800/50 p-5 rounded-lg shadow-lg shadow-black">
          <div className="flex flex-col [&>*]:my-2 md:flex-row items-center my-5">
            <p>Filter by:</p>
            <select
              name="select"
              id="select"
              className="mx-2 bg-green-800/50 rounded-md shadow-md shadow-black/50 focus:outline-none"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}>
              <option value="">--- Select your filter ---</option>
              <option value="price">Price</option>
              <option value="distance">
                Distance from your location (or any specified on the map)
              </option>
              <option value="rating">Rating</option>
              <option value="name">Name of the accommodation</option>
            </select>
            {filterValue === "name" && (
              <input
                type="text"
                className="bg-green-800/50 shadow-md shadow-black/50 rounded-md focus:outline-none"
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
              />
            )}
            {(filterValue === "price" ||
              filterValue === "distance" ||
              filterValue === "rating") && (
              <div className="flex items-center">
                <select
                  name="comparison"
                  id="comparison"
                  className="mx-2 bg-green-800/50 rounded-md shadow-md shadow-black/50 focus:outline-none"
                  value={comparisonValue}
                  onChange={(e) => setComparisonValue(e.target.value)}>
                  <option value="=">=</option>
                  <option value="<">{"<"}</option>
                  <option value=">">{">"}</option>
                </select>
                <input
                  type="number"
                  name="number"
                  id="number"
                  className="bg-green-800/50 rounded-md shadow-md shadow-black/50 focus:outline-none px-2 max-w-[5rem]"
                  value={numberValue}
                  min={filterValue === "rating" ? "1" : "0"}
                  max={filterValue === "rating" ? "5" : "30000"}
                  step={filterValue === "rating" ? "0.5" : "5"}
                  onChange={(e) => setNumberValue(e.target.value)}
                />
              </div>
            )}
          </div>
          {filterValue === "distance" && (
            <MapContainer
              className="!w-[30rem] !h-[15rem] !text-black rounded-lg"
              center={coords}
              zoom={13}
              scrollWheelZoom={false}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Search provider={new OpenStreetMapProvider()} />
              {data?.map((el) => {
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
          )}
        </div>
      )}
      <div
        className={`grid gap-10 mt-10 ${
          props.profile ? "sm:grid-cols-2" : "2xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2"
        }`}>
        {data?.map((el) => {
          const postOwner = usersData?.find((arg) => arg.username === el.userID);
          const ownerFullName = postOwner?.firstName + " " + postOwner?.lastName;
          const rent = (
            <Rent
              key={el.id}
              id={el.id}
              ownerFullName={ownerFullName}
              name={el.name}
              image={el.image}
              price={el.price}
              latitude={el.latitude}
              longitude={el.longitude}
              profile={props.profile}
              distance={countDistance(el.latitude, el.longitude)}
              avgRating={getRating(el)}
              showDetails={() => setDetail(el)}
              deletePost={() => deletePost(el.id, el.image)}
            />
          );
          if (props.profile) {
            if (el.userID === curUsername) {
              return rent;
            }
          } else if (addFilter) {
            if (filterValue === "rating") {
              if (comparisonValue === "=") {
                if (getRating(el) === +numberValue) {
                  return rent;
                }
              } else if (comparisonValue === "<") {
                if (getRating(el) < +numberValue) {
                  return rent;
                }
              } else if (comparisonValue === ">") {
                if (getRating(el) > +numberValue) {
                  return rent;
                }
              }
            } else if (filterValue === "name") {
              const matchingName = el.name.toLowerCase();
              const dataFilter = data?.filter(() => matchingName.includes(textValue.toLowerCase()));
              const filteredData = dataFilter?.find((fil) => fil === el);
              if (filteredData) {
                return rent;
              }
            } else if (filterValue === "price") {
              if (comparisonValue === "=") {
                if (el.price === +numberValue) {
                  return rent;
                }
              } else if (comparisonValue === "<") {
                if (el.price < numberValue) {
                  return rent;
                }
              } else if (comparisonValue === ">") {
                if (el.price > +numberValue) {
                  return rent;
                }
              }
            } else if (filterValue === "distance") {
              if (comparisonValue === "=") {
                if (countDistance(el.latitude, el.longitude) === +numberValue) {
                  return rent;
                }
              } else if (comparisonValue === "<") {
                if (countDistance(el.latitude, el.longitude) < +numberValue) {
                  return rent;
                }
              } else if (comparisonValue === ">") {
                if (countDistance(el.latitude, el.longitude) > +numberValue) {
                  return rent;
                }
              }
            }
          } else {
            return rent;
          }
        })}
      </div>
    </div>
  );
};

export default Accommodation;
