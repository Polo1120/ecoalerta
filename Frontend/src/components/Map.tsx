import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  center?: [number, number];
  zoom?: number;
  heightClass?: string;
}

export default function EcoMap({ center = [4.6097, -74.0817], zoom = 13, heightClass = 'min-h-[400px]' }: MapProps) {
  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-zinc-200 shadow-sm relative z-0">
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} className={`w-full h-full ${heightClass}`}>
        {/* Using Mapbox tiles (Replace access token later) or default to OpenStreetMap */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center}>
          <Popup>
            <div className="text-zinc-900 font-medium">
              Alerta Ecológica Registrada.<br /> Prioridad: Alta.
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
