import React, { useState, useEffect, useContext } from "react";
import { useUpdate } from "../hooks/use-update";
import Loading from "../components/loading";
import Destination from "../components/destination";
import DestinationDetail from "../components/destinationDetail";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { OpenStreetMapProvider, GeoSearchControl } from "leaflet-geosearch";
import "leaflet-geosearch/dist/geosearch.css";
import { goldIcon, greenIcon, purpleIcon } from "../core/icons";
import supabase from "../core/supabase";
import { api } from "../core/api";
import { AuthContext } from "../context/AuthContext";

const Destinations = (props) => {
  const { notifyContext } = useContext(AuthContext);

  const lat = localStorage.getItem("lat");
  const lon = localStorage.getItem("lon");
  const curUsername = localStorage.getItem("curUser");
  const { data, isLoading, refetch } = useUpdate("/destinations");
  const { data: usersData, isLoading: usersLoading } = useUpdate("/users");
  const { data: likesData, isLoading: likesLoading } = useUpdate("/likes");
  const { data: dislikesData, isLoading: dislikesLoading } = useUpdate("/dislikes");
  const { data: rentsData, isLoading: rentsLoading } = useUpdate("/rents");
  // if true, show a specific trip suggestion, else show a list of all trip suggestions
  const [detail, setDetail] = useState(false);
  // state tracking if a user wishes to add filter
  const [addFilter, setAddFilter] = useState(false);
  // states tracking values for filtering trip suggestions
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
        icon: goldIcon,
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

  // Function counting how far away is a certain trip suggestion from your current location or location specified on the map
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

  const countLikes = (id) => {
    let count = 0;
    likesData?.map((arg) => {
      if (arg.postID === id) count++;
    });
    return count;
  };

  const countDislikes = (id) => {
    let count = 0;
    dislikesData?.map((arg) => {
      if (arg.postID === id) count++;
    });
    return count;
  };

  const deletePost = async (id, image) => {
    if (window.confirm("Really wanna delete the post?")) {
      const { data: presentData } = await supabase.storage.from("traveling").list("destinations");
      const curFile = presentData.find((el) => image.includes(el.name));
      console.log(curFile);
      const { data, error } = await supabase.storage
        .from("traveling")
        .remove([`destinations/${curFile.name}`]);

      if (error) {
        console.log("Error deleting file", error);
      } else {
        console.log("File successfully deleted!", data);
      }

      setSubmitting(true);
      await api
        .delete(`/destinations/${id}`, {
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

  const loading = isLoading || usersLoading || likesLoading || dislikesLoading || rentsLoading;
  if (loading) return <Loading />;

  return detail ? (
    <DestinationDetail
      id={detail?.id}
      userID={detail?.userID}
      name={detail?.name}
      startDate={detail?.startDate}
      endDate={detail?.endDate}
      description={detail?.description}
      freeSpots={detail?.freeSpots}
      image={detail?.image}
      latitude={detail?.latitude}
      longitude={detail?.longitude}
      picID={detail?.picID}
      profile={props.profile}
      distance={countDistance(detail?.latitude, detail?.longitude)}
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
              <option value="popularity">Popularity (likes minus dislikes)</option>
              <option value="distance">
                Distance from your location (or any specified on the map)
              </option>
              <option value="tripGuide">Trip guide (post owner)</option>
              <option value="name">Name of the trip</option>
            </select>
            {(filterValue === "tripGuide" || filterValue === "name") && (
              <input
                type="text"
                className="bg-green-800/50 rounded-md shadow-md shadow-black/50 focus:outline-none"
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
              />
            )}
            {(filterValue === "popularity" || filterValue === "distance") && (
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
                  className="px-2 bg-green-800/50 rounded-md shadow-md shadow-black/50 max-w-[3rem] focus:outline-none"
                  value={numberValue}
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
          const destination = (
            <Destination
              key={el.id}
              id={el.id}
              ownerFullName={ownerFullName}
              name={el.name}
              image={el.image}
              latitude={el.latitude}
              longitude={el.longitude}
              profile={props.profile}
              distance={countDistance(el.latitude, el.longitude)}
              deletePost={() => deletePost(el.id, el.image)}
              showDetails={() => setDetail(el)}
            />
          );
          if (props.profile) {
            if (el.userID === curUsername) {
              return destination;
            }
          } else if (addFilter) {
            if (filterValue === "tripGuide") {
              const findMatchingUser = usersData.find((arg) => arg.username === el.userID);
              const fullName = findMatchingUser?.firstName + " " + findMatchingUser?.lastName;
              const matchingUser = fullName.toLowerCase();
              const dataFilter = data?.filter(() => matchingUser.includes(textValue.toLowerCase()));
              const filteredData = dataFilter?.find((fil) => fil === el);
              if (filteredData) {
                return destination;
              }
            } else if (filterValue === "name") {
              const matchingName = el.name.toLowerCase();
              const dataFilter = data?.filter(() => matchingName.includes(textValue.toLowerCase()));
              const filteredData = dataFilter?.find((fil) => fil === el);
              if (filteredData) {
                return destination;
              }
            } else if (filterValue === "popularity") {
              const popularity = countLikes(el.id) - countDislikes(el.id);
              if (comparisonValue === "=") {
                if (popularity === +numberValue) {
                  return destination;
                }
              } else if (comparisonValue === "<") {
                if (popularity < numberValue) {
                  return destination;
                }
              } else if (comparisonValue === ">") {
                if (popularity > +numberValue) {
                  return destination;
                }
              }
            } else if (filterValue === "distance") {
              if (comparisonValue === "=") {
                if (countDistance(el.latitude, el.longitude) === +numberValue) {
                  return destination;
                }
              } else if (comparisonValue === "<") {
                if (countDistance(el.latitude, el.longitude) < +numberValue) {
                  return destination;
                }
              } else if (comparisonValue === ">") {
                if (countDistance(el.latitude, el.longitude) > +numberValue) {
                  return destination;
                }
              }
            }
          } else {
            return destination;
          }
        })}
      </div>
    </div>
  );
};

export default Destinations;
