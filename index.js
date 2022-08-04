import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { rooms } from './data.js';

const app = express();
dotenv.config();
const port = process.env.PORT;
app.use(bodyParser.json());


// api end point for creating room
app.post('/createRoom', async (req, res) => {

    // creating new id greater than existing ids
    const newId = Math.max(...rooms.map(room => parseInt(room.id))) + 1;

    // adding new room to the list
    await rooms.push({
        id: newId.toString(),
        room_id: `R${newId}`,
        room_name: `Room_${newId}`,
        seats: req.body.seats,
        amenities: req.body.amenities,
        booking_status: false,
        customer_name: null,
        date: null,
        start_time: null,
        end_time: null,
        price: req.body.price
    });

    // response
    res.status(201).send({ msg: "New Room Created", rooms: rooms });

});


// api end point for booking room
app.post('/bookRoom', async (req, res) => {

    // getting room object from id 
    let room = await rooms.find(room => room.room_id === req.body.room_id);

    if (!room) {
        res.status(400).send({ msg: "Room Id does not exist" });
    }

    let ifBooked = await room.booked_date_details.find(bookedDate => bookedDate.date == req.body.date);

    if (!ifBooked) {
        let { room_id, ...bookingDetails } = req.body;
        await room.booked_date_details.push(bookingDetails);
        res.status(202).send({ msg: "Booking Successful", room: room });
    } else {
        res.status(409).send({ msg: "Room already booked" });
    }
});


// all rooms with booked date
app.get('/allRooms', async (req, res) => {

    let allRooms = [];

    await rooms.map(room => allRooms.push({
        room_Name: room.room_name, booked_date_details: room.booked_date_details
    }));

    res.status(200).send(allRooms)
})


// all customers with booked date
app.get('/allCustomers', async (req, res) => {

    let allCustomers = [];

    await rooms.map(room => room.booked_date_details.map(obj => allCustomers.push({ room_name: room.room_name, ...obj })));

    res.status(200).send(allCustomers)
})


app.listen(port, () => console.log(`app running on port ${port}`));