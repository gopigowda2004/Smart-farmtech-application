import React, { useEffect, useRef } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';

const MapComponent = ({ location }) => {
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);

  useEffect(() => {
    if (googleMapRef.current && location) {
      // Geocode the location to get lat/lng
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: location }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const position = results[0].geometry.location;
          googleMapRef.current.setCenter(position);
          new window.google.maps.Marker({
            position,
            map: googleMapRef.current,
            title: location,
          });
        } else {
          console.error('Geocode was not successful for the following reason: ' + status);
        }
      });
    }
  }, [location]);

  const onLoad = (map) => {
    googleMapRef.current = map;
  };

  const onUnmount = () => {
    googleMapRef.current = null;
  };

  const render = (status) => {
    switch (status) {
      case Status.LOADING:
        return <div>Loading...</div>;
      case Status.FAILURE:
        return <div>Error loading map</div>;
      case Status.SUCCESS:
        return (
          <div ref={mapRef} style={{ height: '400px', width: '100%' }}>
            <GoogleMap
              center={{ lat: 0, lng: 0 }}
              zoom={10}
              onLoad={onLoad}
              onUnmount={onUnmount}
            />
          </div>
        );
    }
  };

  return (
    <Wrapper apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} render={render}>
      {/* The map will be rendered here */}
    </Wrapper>
  );
};

const GoogleMap = ({ onLoad, onUnmount, center, zoom }) => {
  const ref = useRef();

  useEffect(() => {
    const map = new window.google.maps.Map(ref.current, {
      center,
      zoom,
    });

    onLoad(map);

    return () => onUnmount();
  }, [onLoad, onUnmount]);

  return <div ref={ref} style={{ height: '100%', width: '100%' }} />;
};

export default MapComponent;