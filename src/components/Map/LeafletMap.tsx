"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import L from "leaflet";
import {
  Circle,
  MapContainer,
  Marker,
  Popup,
  ScaleControl,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type { Epicenter } from "@/lib/types";
import {
  affectedRadiusKm,
  classifyDepth,
  classifyMagnitude,
  formatEnergy,
  seismicStyle,
} from "@/lib/seismic";

interface LeafletMapProps {
  epicenter: Epicenter | null;
  onEpicenter: (epicenter: Epicenter) => void;
  onCoords: (coords: Epicenter | null) => void;
  magnitude: number;
  depth: number;
  waveTick: number;
  waveClear: number;
  shaking: boolean;
}

const epicenterIcon = L.divIcon({
  className: "epicentro-marker",
  html: '<div style="width:20px;height:20px;border-radius:50%;background:#f43f5e;border:3px solid white;box-shadow:0 0 15px rgba(244,63,94,0.85)"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const bogotaIcon = L.divIcon({
  className: "",
  html: '<div style="width:12px;height:12px;border-radius:50%;background:#2563eb;border:2px solid white;box-shadow:0 0 8px rgba(37,99,235,0.7)"></div>',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

function MapEvents({
  onEpicenter,
  onCoords,
}: {
  onEpicenter: (epicenter: Epicenter) => void;
  onCoords: (coords: Epicenter | null) => void;
}) {
  useMapEvents({
    click(event) {
      onEpicenter({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
    mousemove(event) {
      onCoords({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
    mouseout() {
      onCoords(null);
    },
  });

  return null;
}

interface Wave {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
}

function WaveOverlay({
  epicenter,
  waveTick,
  waveClear,
  magnitude,
  depth,
}: {
  epicenter: Epicenter | null;
  waveTick: number;
  waveClear: number;
  magnitude: number;
  depth: number;
}) {
  const map = useMap();
  const [waves, setWaves] = useState<Wave[]>([]);
  const magnitudeRef = useRef(magnitude);
  const depthRef = useRef(depth);

  useEffect(() => {
    magnitudeRef.current = magnitude;
  }, [magnitude]);

  useEffect(() => {
    depthRef.current = depth;
  }, [depth]);

  useEffect(() => {
    setWaves([]);
  }, [waveClear]);

  useEffect(() => {
    if (!epicenter || waveTick === 0) return;

    const point = map.latLngToContainerPoint([epicenter.lat, epicenter.lng]);
    const radiusKm = affectedRadiusKm(magnitudeRef.current, depthRef.current);
    const size = Math.min(700, Math.max(160, radiusKm * 4));
    const duration = Math.max(1.2, 2.8 - magnitudeRef.current * 0.15);

    setWaves((current) => [
      ...current,
      {
        id: Date.now() + Math.random(),
        x: point.x,
        y: point.y,
        size,
        duration,
      },
    ]);
  }, [epicenter, waveTick, map]);

  return (
    <div className="pointer-events-none absolute inset-0 z-[800] overflow-hidden">
      {waves.map((wave) => (
        <div
          key={wave.id}
          className="seismic-wave"
          style={
            {
              left: wave.x,
              top: wave.y,
              animationDuration: `${wave.duration}s`,
              "--wave-size": `${wave.size}px`,
            } as CSSProperties
          }
          onAnimationEnd={() =>
            setWaves((current) => current.filter((item) => item.id !== wave.id))
          }
        />
      ))}
    </div>
  );
}

export default function LeafletMap({
  epicenter,
  onEpicenter,
  onCoords,
  magnitude,
  depth,
  waveTick,
  waveClear,
  shaking,
}: LeafletMapProps) {
  const radiusKm = epicenter ? affectedRadiusKm(magnitude, depth) : 0;
  const style = useMemo(() => seismicStyle(magnitude), [magnitude]);

  return (
    <MapContainer
      center={[4.5709, -74.2973]}
      zoom={6}
      scrollWheelZoom
      className={`h-full w-full ${shaking ? "map-shaking" : ""}`}
    >
      <TileLayer
        attribution="© OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={18}
      />

      <ScaleControl imperial={false} position="bottomleft" />
      <MapEvents onEpicenter={onEpicenter} onCoords={onCoords} />

      <Marker position={[4.711, -74.0721]} icon={bogotaIcon}>
        <Popup>
          <b>Bogotá</b>
          <br />
          Capital de Colombia
        </Popup>
      </Marker>

      {epicenter && (
        <>
          <Circle
            center={[epicenter.lat, epicenter.lng]}
            radius={radiusKm * 1000}
            pathOptions={{
              color: style.strokeColor,
              fillColor: style.fillColor,
              fillOpacity: style.fillOpacity,
              weight: 2,
            }}
          />
          <Marker position={[epicenter.lat, epicenter.lng]} icon={epicenterIcon}>
            <Popup>
              <b>📍 Epicentro del sismo</b>
              <br />
              Lat: {epicenter.lat.toFixed(6)}°
              <br />
              Lng: {epicenter.lng.toFixed(6)}°
              <br />
              <b>Magnitud:</b> {magnitude.toFixed(1)} Richter (
              {classifyMagnitude(magnitude)})
              <br />
              <b>Profundidad:</b> {depth} km ({classifyDepth(depth)})
              <br />
              <b>Radio afectado:</b> {radiusKm.toFixed(1)} km
              <br />
              <b>Energía liberada:</b> {formatEnergy(magnitude)}
            </Popup>
          </Marker>
        </>
      )}

      <WaveOverlay
        epicenter={epicenter}
        waveTick={waveTick}
        waveClear={waveClear}
        magnitude={magnitude}
        depth={depth}
      />
    </MapContainer>
  );
}
