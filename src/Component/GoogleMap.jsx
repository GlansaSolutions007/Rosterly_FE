import { useEffect, useRef } from 'react';

const GoogleMapSelector = ({ onLocationSelect, address }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const mapAPI = import.meta.env.VITE_MAP_API;

  useEffect(() => {
    if (!window.google || !mapRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: -33.8688, lng: 151.2093 },
      zoom: 14,
      mapId: mapAPI,
    });

    mapInstanceRef.current = map;

    map.addListener('click', (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();

      onLocationSelect?.({ lat, lng });

      if (!markerRef.current) {
        markerRef.current = new window.google.maps.Marker({
          position: { lat, lng },
          map,
        });
      } else {
        markerRef.current.setPosition({ lat, lng });
      }
    });
  }, []);

  useEffect(() => {
    if (!address || !window.google || !mapInstanceRef.current) return;

    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();

        mapInstanceRef.current.setCenter({ lat, lng });

        if (!markerRef.current) {
          markerRef.current = new window.google.maps.Marker({
            position: { lat, lng },
            map: mapInstanceRef.current,
          });
        } else {
          markerRef.current.setPosition({ lat, lng });
        }

        onLocationSelect?.({ lat, lng });

      } else {
        switch (status) {
          case 'ZERO_RESULTS':
            console.warn('No matching location found. Try being more specific.');
            break;
          case 'OVER_QUERY_LIMIT':
            console.error('Geocoder: Query limit exceeded.');
            break;
          case 'REQUEST_DENIED':
            console.error('Geocoder: API key is invalid or not authorized.');
            break;
          case 'INVALID_REQUEST':
            console.error('Geocoder: Invalid request. Address missing or malformed.');
            break;
          default:
            console.error('Geocode failed: ', status);
        }
      }
    });

  }, [address]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
};

export default GoogleMapSelector;
