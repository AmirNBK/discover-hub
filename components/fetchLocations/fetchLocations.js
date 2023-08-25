export async function fetchUserLocationAndData(setUserLocation, setData) {
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: 'fsq3aCgzAkodfbe6Y0mhTbwzAJVr/U+Ls6sJJjujRz/EMOs='
        }
    };
    try {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation({ latitude, longitude });

                try {
                    const response = await fetch(`https://api.foursquare.com/v3/places/nearby?ll=${latitude},${longitude}`, options);
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    const responseData = await response.json();
                    const venues = responseData.results || [];
                    setData(venues);
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            },
            (error) => {
                console.error('Error getting user location:', error);
            }
        );
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}
