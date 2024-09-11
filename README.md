# FE23_PowerRangers

CREATE BOOKING
--------------------
Booking of room can be done for available rooms in rooms database.
3 room types are available:
-single (1 bed)
-double (2 beds)
-suite (3 beds)

A booking request must specify number of guests and specify number of room type(s).
Mandatory input must be provided in the POST request, (see below).
System checks that number of guests <=  requested number of beds in room(s).
System checks that requested room(s) are not booked.
Max 20 rooms can be booked within one booking.
Total price for booking is calculated ( number of days * requested room(s).

Make a room reservation: 
POST:  /booking
{
	"date":"23 Sep",
	"checkIn":"23 Sep",
	"checkOut":"26 Sep",
	"numberOfGuests":"2",
	"singleRooms":"0",
  "doubleRooms": 1,
  "suiteRooms": 0,
	"name":"Ada Lovelace",
	"email": "ada.love@example.com"
}

Booking response include following parts: 
		"message": "Booking confirmation",
		"bookingId": "3c14b0ae-2159-4452-8e34-5cc9558f376c",
		"numberOfGuests": "3",
		"roomTypes": {
			"Single": 1,
			"Double": 1
		},
		"totalPrice": 4500,
		"checkIn": "23 Sep",
		"checkOut": "26 Sep",
		"name": "Ada Lovelace"


UPDATE BOOKING
----------------
To Update a booking the bookingId is sent in the Path. Booking specifications that should be updated are defined in the body.
After check that provided booking (bookingId) is correct, the reservated room(s) in this booking is/are released in the rooms-db.
Then the procedure is pretty much the same as for CreatingBooking, i.e
-System checks that number of guests <=  requested number of beds in room(s).
-System checks that requested room(s) are not booked.
-Total price for booking is calculated ( number of days * requested room(s).

Finally the actual bookingId in booking.db is updated and a response is sent.

PUT: /bookings/{bookingId}
in the Body attach following and do necessary update(s).

{
  "checkIn": "2024-09-25",
  "checkOut": "2024-09-27",
  "numberOfGuests": 1,
  "singleRooms": 0,
  "doubleRooms": 1,
  "suiteRooms": 0
}
the request response include following parts:
		"message": "Booking updated successfully",
		"bookingId": "59bce609-affd-4602-859d-5f401c1c9e0d",
		"numberOfGuests": 1,
		"roomTypes": {
			"Double": 1
		},
		"totalPrice": 2000,
		"checkIn": "2024-09-25",
		"checkOut": "2024-09-27"


DELETE BOOKING
--------------------
DELETE: /bookings/{bookingId}
the request response:
		"message": "Booking with id 98d4b6f6-ac33-42f5-be84-26a58038f8c4 has been successfully cancelled"


GET BOOKINGS
----------------
GET: /admin/bookings
  the request response lists all bookings including following parts:
    -Booking number:
    -check-in:
		-check-out:
		-Number of guests:
		-Rooms:[  ]
    -Name:
		-Total Price:
    -Created date:
   
 

 ERROR-messages
 ----------------
 Number of rooms in a booking > 20:
  request: 
	{
	"date":"23 Sep",
	"checkIn":"23 Sep",
	"checkOut":"28 Sep",
	"numberOfGuests":"50",
	"singleRooms":"16",
  "doubleRooms": 2,
  "suiteRooms": 3,
  "name": "Sara Sjö",
  "email": "sara.sjo@example.com"
}

response: 
	"errorMessage": {
		"message": "Bokningen överskrider maxantalet av rum (20) för en bokning."