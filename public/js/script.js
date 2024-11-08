const socket=io();



if(navigator.geolocation){
    navigator.geolocation.watchPosition(
        (position)=>{
        const { latitude,longitude}= position.coords;
        socket.emit("send-location", { latitude,longitude});

    },
    (error)=> {
        console.error(error);
    },
    {
        enableHighAccuracy: true,
        timeout:5000,
        maximumAge: 0
    }
);
}


const map=L.map("map").setView([0,0],16);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
    attribution: "Adhivira"
}).addTo(map)


const markers={};

socket.on("receive-location",(data)=>{
    const {id,latitude,longitude}=data;
    map.setView([latitude,longitude]);
    if(markers[id]){
        markers[id].setLatLng([latitude,longitude]);
    }
    else{
        markers[id]=L.marker([latitude,longitude]).addTo(map);
    }
});


socket.on("user-disconnected", (id)=>{
    if(markers[id]){
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});


// const socket = io();
// let previousLocation = { latitude: null, longitude: null };
// const THRESHOLD = 0.0001; // Minimum change to update location

// if (navigator.geolocation) {
//     navigator.geolocation.watchPosition(
//         (position) => {
//             const { latitude, longitude } = position.coords;
            
//             // Check if the new location is significantly different
//             if (
//                 !previousLocation.latitude ||
//                 Math.abs(latitude - previousLocation.latitude) > THRESHOLD ||
//                 Math.abs(longitude - previousLocation.longitude) > THRESHOLD
//             ) {
//                 // Emit location to the server and update previous location
//                 socket.emit("send-location", { latitude, longitude });
//                 previousLocation = { latitude, longitude };
//                 console.log("Significant location update:", latitude, longitude); // For debugging
//             }
//         },
//         (error) => {
//             console.error("Geolocation error:", error);
//         },
//         {
//             enableHighAccuracy: true,
//             timeout: 5000,
//             maximumAge: 0,
//         }
//     );
// }

// // Remaining map code to display and update markers as before
// const map = L.map("map").setView([0, 0], 16);
// L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//     attribution: "Adhivira"
// }).addTo(map);

// const markers = {};
// let initialLocationSet = false;

// socket.on("receive-location", (data) => {
//     const { id, latitude, longitude } = data;

//     if (!initialLocationSet) {
//         map.setView([latitude, longitude]);
//         initialLocationSet = true;
//     }

//     if (markers[id]) {
//         markers[id].setLatLng([latitude, longitude]);
//     } else {
//         markers[id] = L.marker([latitude, longitude]).addTo(map);
//     }
// });

// socket.on("user-disconnected", (id) => {
//     if (markers[id]) {
//         map.removeLayer(markers[id]);
//         delete markers[id];
//     }
// });