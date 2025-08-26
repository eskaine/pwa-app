import { useState, useEffect } from 'react';

export const LocationComponent = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [watching, setWatching] = useState(true);
  const [data, setData] = useState([]);


  // useEffect(() => {
  //   let watchId;

  //   if (!navigator.geolocation) {
  //     setError('Geolocation is not supported by this browser');
  //     return;
  //   }

  //   setLoading(true);
  //   setWatching(true);

  //   watchId = navigator.geolocation.watchPosition(
  //     (position) => {
  //       setLocation({
  //         latitude: position.coords.latitude,
  //         longitude: position.coords.longitude,
  //         accuracy: position.coords.accuracy,
  //         timestamp: position.timestamp
  //       });


  //       console.log("position", data)
  //       console.log("position2", position.timestamp)
  //       setData([...data, position.timestamp]);

  //       setError(null);
  //       setLoading(false);
  //     },
  //     (error) => {
  //       setError(error.message);
  //       setLoading(false);
  //     },
  //     {
  //       enableHighAccuracy: true,
  //       timeout: 10000,
  //       maximumAge: 60000
  //     }
  //   );

  //   return () => {
  //     if (watchId) {
  //       navigator.geolocation.clearWatch(watchId);
  //       setWatching(false);
  //     }
  //   };
  // }, []);

  useEffect(() => {
     setInterval(() => {
      getCurrentLocation();
    }, 10000);

    // return () => clearInterval(intervalId);
  }, []);

  const getCurrentLocation = () => {
    setLoading(true);
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
           console.log("position", data)
        console.log("position2", position.timestamp)
        const timeString = new Date(position.timestamp).toLocaleTimeString();
        setData(prevData => [...prevData, timeString]);

        setLoading(false);
      },
      (error) => {
        setError(error.message);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <div>
      <div style={{marginBottom: '10px'}}>
        <span style={{color: watching ? 'green' : 'orange'}}>
          {watching ? '📍 Location tracking active' : '⏸️ Location tracking paused'}
        </span>
      </div>
      
      {/* <button onClick={getCurrentLocation} disabled={loading}>
        {loading ? 'Getting Location...' : 'Refresh Location'}
      </button> */}
      
      {/* {location && (
        <div>
          <p>Latitude: {location.latitude}</p>
          <p>Longitude: {location.longitude}</p>
          <p>Accuracy: {location.accuracy} meters</p>
          <p>Last updated: {new Date(location.timestamp).toLocaleTimeString()}</p>
        </div>
      )} */}

       <div>
        {data.map(d => {
            return <div>timestamp: {d}</div>
        })}
      </div>
      
      {error && <p style={{color: 'red'}}>Error: {error}</p>}
      
    </div>
  );
};
