import Map from  '../../components/Map'

const DEFAULT_CENTER = [38.907132, -77.036546]

export default function MapContainer() {
    return (
                    <Map className='' width="800" height="400" center={DEFAULT_CENTER} zoom={12}>
                        {({ TileLayer, Marker, Popup }) => (
                            <>
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                                />
                                <Marker position={DEFAULT_CENTER}>
                                    <Popup>
                                        A pretty CSS3 popup. <br /> Easily customizable.
                                    </Popup>
                                </Marker>
                            </>
                        )}
                    </Map>
    )
}