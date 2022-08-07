import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { hallsList } from './data.js';

const app = express();
dotenv.config();
const port = process.env.PORT;
app.use(bodyParser.json());


// api end point for creating new hall
app.post('/createHall', async (req, res) => {

    // creating new id greater than existing ids
    const newId = Math.max(...hallsList.map(hall => parseInt(hall.id))) + 1;

    // adding new hall to the list
    await hallsList.push({
        id: newId.toString(),
        hall_id: `R${newId}`,
        hall_name: `Hall_${newId}`,
        seats: req.body.seats,
        amenities: req.body.amenities,
        price: req.body.price,
        booked_date_details: [],
    });

    // response
    res.status(201).send({ msg: "New Hall Created", hallsList: hallsList });

});


// api end point for booking room
app.post('/bookHall', async (req, res) => {

    // getting hall object from id 
    let hall = await hallsList.find(hall => hall.hall_id === req.body.hall_id);
    let reqDate = new Date(req.body.date).toDateString();

    if (!hall) {
        res.status(400).send({ msg: "Hall Id does not exist" });
    } else if (reqDate == 'Invalid Date') {
        res.status(400).send({ msg: "Invalid date or format. Date formate MM-DD-YYYY" });
    } else {

        let { hall_id, ...bookingDetails } = req.body;
        let bookedDates = await hall.booked_date_details.map(obj => obj.date);
        let isBooked = await bookedDates.find((date) => new Date(date).toDateString() === reqDate);
        let bookedObject = await hall.booked_date_details//.filter((obj) => {

        if (!isBooked) {
            console.log(1);
            await hall.booked_date_details.push(bookingDetails);
            res.status(202).send({ msg: "Booking Successful", hall: hall })

        } else if (isBooked) {

            let reqStartTime = req.body.start_time;
            let reqEndTime = req.body.end_time;

            for (let i = 0; i <= bookedDates.length; i++) {

                if (i < bookedDates.length) {
                    if (reqStartTime == bookedObject[i].start_time && reqEndTime == bookedObject[i].end_time) {

                        res.status(409).send({ msg: "Hall was already booked in this time", hall: hall });
                        break;

                    } else if (new Date('01-01-2000 ' + bookedObject[i].start_time) < new Date('01-01-2000 ' + reqStartTime)
                        &&
                        new Date('01-01-2000 ' + reqStartTime) < new Date('01-01-2000 ' + bookedObject[i].end_time)) {

                        res.status(409).send({ msg: "Hall was already booked in this time", hall: hall });
                        break;

                    } else if (new Date('01-01-2000 ' + bookedObject[i].start_time) < new Date('01-01-2000 ' + reqEndTime)
                        &&
                        new Date('01-01-2000 ' + reqEndTime) < new Date('01-01-2000 ' + bookedObject[i].end_time)) {

                        res.status(409).send({ msg: "Hall was already booked in this time", hall: hall });
                        break;
                    } else if (new Date('01-01-2000 ' + reqStartTime) < new Date('01-01-2000 ' + bookedObject[i].start_time)
                        &&
                        new Date('01-01-2000 ' + reqEndTime) > new Date('01-01-2000 ' + bookedObject[i].end_time)) {

                        res.status(409).send({ msg: "Hall was already booked in this time", hall: hall });
                        break;
                    }
                } else {
                    console.log('2.c');
                    await hall.booked_date_details.push(bookingDetails);
                    res.status(202).send({ msg: "Booking Successful", hall: hall })
                }
            }
        }
    }
});


// all hallsList with booked date
app.get('/allhallLists', async (req, res) => {

    let allhallsList = [];

    await hallsList.map(hall => allhallsList.push({
        hall_Name: hall.hall_name, booked_date_details: hall.booked_date_details
    }));

    res.status(200).send(allhallsList)
})


// all customers with booked date
app.get('/allCustomers', async (req, res) => {

    let allCustomers = [];

    await hallsList.map(hall => hall.booked_date_details.map(obj => allCustomers.push({ hall_name: hall.hall_name, ...obj })));

    res.status(200).send(allCustomers)
})


app.listen(port, () => console.log(`app running on port ${port}`));