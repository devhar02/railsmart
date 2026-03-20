import { generateBookingConfirmation } from "./mockData.js";

function validatePassengers(passengers) {
  const errors = [];
  passengers.forEach((p, i) => {
    const n = i + 1;
    if (!p.name || !/^[a-zA-Z\s]{2,50}$/.test(p.name.trim()))
      errors.push(`Passenger ${n}: Name must be 2-50 letters only.`);
    const age = parseInt(p.age);
    if (!p.age || isNaN(age) || age < 1 || age > 120)
      errors.push(`Passenger ${n}: Age must be between 1 and 120.`);
  });
  return errors;
}

function validateContact(email, phone) {
  const errors = [];
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.push("Invalid email address.");
  if (!/^[0-9]{10}$/.test(phone))
    errors.push("Phone must be exactly 10 digits.");
  return errors;
}

function assignSeats(travelClass, count) {
  const seats = [];
  for (let i = 0; i < count; i++) {
    const coach = String.fromCharCode(65 + Math.floor(Math.random() * 6)); // A-F
    const num = Math.floor(Math.random() * 72) + 1;
    seats.push(`${travelClass}-${coach}${num}`);
  }
  return seats;
}

export async function runBookingAgent({ train, passengers, contactEmail, contactPhone, travelClass }) {
  // Validate
  const passengerErrors = validatePassengers(passengers);
  const contactErrors = validateContact(contactEmail, contactPhone);
  const errors = [...passengerErrors, ...contactErrors];

  if (errors.length > 0) {
    return { success: false, agent: "BookingAgent", errors };
  }

  const classData = train.classes[travelClass];
  if (!classData) {
    return { success: false, agent: "BookingAgent", errors: [`Class ${travelClass} not available on this train.`] };
  }

  const seatNumbers = assignSeats(travelClass, passengers.length);
  const totalFare = classData.fare * passengers.length;

  const booking = generateBookingConfirmation({
    train,
    passengers,
    travelClass,
    contactEmail,
    contactPhone,
    seatNumbers,
    farePerPassenger: classData.fare,
    totalFare,
  });

  return {
    success: true,
    agent: "BookingAgent",
    booking,
    message: `Booking confirmed for ${passengers.length} passenger(s). PNR: ${booking.pnr}`,
  };
}
