"use client";

import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl: "/leaflet/marker-icon.png",
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

type MapActivity = {
  location: string;
  description: string;
  timeSlot: string;
  latitude: number;
  longitude: number;
  estimatedCost: number;
};

type MapDay = {
  id: number;
  dayNumber: number;
  title: string;
  activities: MapActivity[];
};

type TripMapProps = {
  days: MapDay[];
};

const MapView = ({ days }: { days: MapDay[] }) => {
  const map = useMap();

  const activities = days.flatMap((day) =>
    day.activities.filter(
      (activity) =>
        Number.isFinite(activity.latitude) &&
        Number.isFinite(activity.longitude),
    ),
  );

  if (activities.length > 0) {
    const bounds = L.latLngBounds(
      activities.map((activity) => [activity.latitude, activity.longitude]),
    );

    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }

  return null;
};

const TripMap = ({ days }: TripMapProps) => {
  const sortedDays = [...days].sort((a, b) => a.dayNumber - b.dayNumber);

  const [selectedDay, setSelectedDay] = useState<number>(
    sortedDays[0]?.dayNumber ?? 1,
  );

  const day = sortedDays.find((item) => item.dayNumber === selectedDay);

  const activities = (day?.activities ?? []).filter(
    (activity) =>
      Number.isFinite(activity.latitude) &&
      Number.isFinite(activity.longitude) &&
      activity.latitude >= -90 &&
      activity.latitude <= 90 &&
      activity.longitude >= -180 &&
      activity.longitude <= 180,
  );

  const center: [number, number] =
    activities.length > 0
      ? [activities[0].latitude, activities[0].longitude]
      : [48.8566, 2.3522];

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-[#DCE9D9] bg-white shadow-sm">
      <div className="bg-[#F7F8F5] p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#84A282]">
          Interactive map
        </p>
        <h3 className="mt-1 text-xl font-bold text-[#2C5745]">
          Explore your trip
        </h3>

        <div className="mt-3 flex flex-wrap gap-2">
          {sortedDays.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedDay(item.dayNumber)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 active:scale-95 ${
                selectedDay === item.dayNumber
                  ? "bg-[#2C5745] text-white shadow-sm"
                  : "border border-[#DCE9D9] bg-white text-[#2C5745] hover:bg-[#DCE9D9]"
              }`}
            >
              Day {item.dayNumber}
            </button>
          ))}
        </div>

        {day && (
          <p className="mt-3 text-sm text-gray-600">
            Day {day.dayNumber}: {day.title} · {activities.length} mapped
            activities
          </p>
        )}
      </div>

      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom={true}
        className="h-[350px] w-full sm:h-[450px]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapView days={day ? [day] : []} />

        {activities.map((activity, index) => (
          <Marker
            key={`${selectedDay}-${index}`}
            position={[activity.latitude, activity.longitude]}
          >
            <Popup>
              <div>
                <strong>{activity.location}</strong>
                <p>{activity.timeSlot}</p>
                <p>{activity.description}</p>
                <p>Estimated cost: ${activity.estimatedCost}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {activities.length > 1 && (
          <Polyline
            positions={activities.map((activity) => [
              activity.latitude,
              activity.longitude,
            ])}
            pathOptions={{ color: "#2C5745", weight: 4, opacity: 0.85 }}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default TripMap;
