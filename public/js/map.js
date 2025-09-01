mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v12",
  center: listing.geometry.coordinates,
  zoom: 11,
  scrollZoom: false,
  dragRotate: false,
  touchZoomRotate: false,
});

// ✅ Disable scroll zooming only
map.scrollZoom.disable();

// ✅ Allow only + - buttons for zoom
map.addControl(new mapboxgl.NavigationControl({ showCompass: false }));

// ✅ Add fullscreen toggle button
map.addControl(new mapboxgl.FullscreenControl());

// ✅ Add geolocate control (user location show)
map.addControl(
  new mapboxgl.GeolocateControl({
    positionOptions: { enableHighAccuracy: true },
    trackUserLocation: true,
    showAccuracyCircle: false,
  })
);

// ✅ Add scale bar
map.addControl(
  new mapboxgl.ScaleControl({
    maxWidth: 100,
    unit: "metric",
  })
);

// ✅ Custom marker element (house icon)
const el = document.createElement("div");
el.className = "house-marker";

// ✅ Add custom marker with popup
new mapboxgl.Marker(el)
  .setLngLat(listing.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 25 }).setHTML(`
      <div style="width:200px; font-family:sans-serif;">
        <h3 style="margin:8px 0 4px; font-size:16px;">${listing.title}</h3>
        <p style="margin:0; color:gray; font-size:14px;">${listing.location}</p>
        <p style="margin:4px 0; font-weight:bold;">${listing.price} / night</p>
      </div>
    `)
  )
  .addTo(map);
