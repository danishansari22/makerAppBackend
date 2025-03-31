const Machine = require('../Models/machineModel');
const path = require('path');
const Booking = require('../Models/bookingModel');
const Vendor = require('../Models/vendorModel');
module.exports.getMachines = async (req, res) => {
  try {
      const machines = await Machine.find();
      const machinesWithImages = machines.map(machine => ({
        ...machine._doc,
        images: machine.images ? machine.images.map(imagePath => `${req.protocol}://${req.get('host')}/api/statics${path.join('/', imagePath).replace(/\\/g, '/')}`) : []
      }));
      res.json({machines: machinesWithImages});
  } catch (error) {
    console.log(error);
      res.status(500).json({ message: 'Server error', error });
  }
};


module.exports.getSpecificMachine = async (req, res) => {
    try {
        const { machineId } = req.params;
        const machine = await Machine.findById(machineId);
        const machineWithImages = {
            ...machine._doc,
            images: machine.images.map(imagePath => `${req.protocol}://${req.get('host')}/${imagePath}`)
        };
        

    
        const vendor = await Vendor.findById(machine.vendorId);
        if (!machine) {
            return res.status(404).json({ message: 'Machine not found' });
        }
        res.json({machine: machineWithImages, vendor: vendor});
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports.addMachine = async (req, res) => {

    try {
        console.log(req.body);
        const { name,category, brandName, modelNumber, pricePerHour, bookableTimings, technicalDetails, vendorId } = req.body;
        const images = req.files.map(file=>file.path);

        const newMachine = new Machine({
            name,
            category,
            brandName,
            modelNumber,
            pricePerHour,
            bookableTimings: JSON.parse(bookableTimings),
            technicalDetails,
            images,
            vendorId
        });

        await newMachine.save();
        res.status(201).json({ message: 'Machine added successfully', machine: newMachine });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports.getBookingCalender = async (req, res) => {
    try {
        const { machineId } = req.params;
        const bookings = await Booking.find({ machineId }, 'start end');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
//create a function to get all available date for booking a machine
// ...existing code...

// ...existing code...

module.exports.getAvailableDatesForBooking = async (req, res) => {
    try {
        const { machineId } = req.params;
        const bookings = await Booking.find({ machineId }, 'start end');

        // Assuming you want to find available slots within a specific range
        const startDate = new Date(); // current date
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1); // one month from now

        let availableSlots = [];
        let currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            let daySlots = [];

            for (let hour = 0; hour < 24; hour++) {
                let isAvailable = true;
                let slotStart = new Date(currentDate);
                slotStart.setHours(hour, 0, 0, 0);
                let slotEnd = new Date(slotStart);
                slotEnd.setHours(hour + 1, 0, 0, 0);

                for (let booking of bookings) {
                    if ((slotStart >= new Date(booking.start) && slotStart < new Date(booking.end)) ||
                        (slotEnd > new Date(booking.start) && slotEnd <= new Date(booking.end)) ||
                        (slotStart <= new Date(booking.start) && slotEnd >= new Date(booking.end))) {
                        isAvailable = false;
                        break;
                    }
                }

                if (isAvailable) {
                    daySlots.push({
                        start: slotStart.toISOString(),
                        end: slotEnd.toISOString()
                    });
                }
            }

            if (daySlots.length > 0) {
                availableSlots.push({
                    date: currentDate.toISOString().split('T')[0],
                    slots: daySlots
                });
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }

        res.json(availableSlots);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// ...existing code...

// ...existing code...






module.exports.bookMachine = async (req, res) => {
    try {
        const { machineId, userId, start, end } = req.body;

        const machine = await Machine.findById(machineId);
        if (!machine) {
            return res.status(404).json({ message: 'Machine not found' });
        }
        const overlappingBookings = await Booking.find({
            machineId,
            $or: [
                { start: { $lt: end }, end: { $gt: start } }
            ]
        });

        if (overlappingBookings.length > 0) {
            return res.status(400).json({ message: 'Machine is already booked for the requested time' });
        }

        const newBooking = new Booking({
            machineId,
            userId,
            start,
            end,
            price: machine.pricePerHour * ((end - start) / (1000 * 60 * 60))
        });

        await newBooking.save();
        res.json({ message: 'Machine booked successfully', booking: newBooking });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports.getUserBookings = async (req, res) => {
    try {
        const { userId } = req.params;
        const bookings = await Booking.find({ userId }).populate('machineId');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports.getVendorMachines = async (req, res) => {
    try {
        const { vendorId } = req.params;
        const machines = await Machine.find({ vendorId });
        res.json(machines);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports.getVendorEarnings = async (req, res) => {
    try {
        const { vendorId } = req.params;
        const machines = await Machine.find({ vendorId });
        const machineIds = machines.map(machine => machine._id);
        const bookings = await Booking.find({ machineId: { $in: machineIds } });

        const totalEarnings = bookings.reduce((sum, booking) => sum + booking.price, 0);
        res.json({ totalEarnings, bookings });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};