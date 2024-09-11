# FE23_PowerRangers - Amanda Cyrus, Solveig Béen, Baran 


| Anrop       | Route           | Resultat |
| ------------- |:-------------:| -----:|
| POST      | /booking | Bokar rum |
| DELETE    | /booking{id} | Avbokar rum |
| PUT      | /booking{id} | Uppdaterar bokning |
| GET      | /admin/bookings | Ser alla bokade rum |

## Make a room reservation: <br>
Booking of room can be done for available rooms in rooms database.
3 room types are available:<br>
-single (1 bed)<br>
-double (2 beds)<br>
-suite (3 beds)<br>

A booking request must specify number of guests and specify number of room type(s).<br>
Mandatory input must be provided in the POST request, (see below).<br>
System checks that number of guests <=  requested number of beds in room(s).<br>
System checks that requested room(s) are not booked.<br>
Max 20 rooms can be booked within one booking.<br>
Total price for booking is calculated ( number of days * requested room(s).

** POST: **  
### Path: /booking

#### Body: 

| Command | Description |
| --- | --- |
| "checkIn": | "2024-09-15", | 
| "checkOut": | "2024-09-16", | 
| "numberOfGuests" | 1, | 
| "name": | "Heddy Lamar", | 
| "email": | "heddylamar@example.com", | 
| "singleRooms": | 1 |
| "doubleRooms": | 0 |
| "suiteRooms": | 0 |

#### Response: 
| Command | Description |
| --- | --- |
| "message": | "Booking confirmation", | 
| "bookingId": | "3c14b0ae-2159-4452-8e34-5cc9558f376c", | 
| "numberOfGuests" | 3, | 
| "roomTypes": | -|
|"Single":| 1,|
|      "Double":| 1 | 
| "totalPrice": | "4500", | 
| "checkIn": |23 Sep |
| "checkOuts": | 26 Sep |
| "name": |Heddy Lamar |



## Update booking: <br>

To Update a booking the bookingId is sent in the Path. Booking specifications that should be updated are defined in the body.<br>
After check that provided booking (bookingId) is correct, the reservated room(s) in this booking is/are released in the rooms-db.<br>
Then the procedure is pretty much the same as for CreatingBooking, i.e<br>
-System checks that number of guests <=  requested number of beds in room(s).<br>
-System checks that requested room(s) are not booked.<br>
-Total price for booking is calculated ( number of days * requested room(s).<br>

Finally the actual bookingId in booking.db is updated and a response is sent.<br>
** UPDATE: **  
### Path: /booking{id}
#### Body: 
| Command | Description |
| --- | --- |
| "checkIn": | "2024-09-15", | 
| "checkOut": | "2024-09-16", | 
| "numberOfGuests" | 4, | 
| "singleRooms": | 0 |
| "doubleRooms": | 2 |
| "suiteRooms": | 0 |


#### Response: 
| Command | Description |
| --- | --- |
| "message": | "Booking updated successfully", | 
| "bookingId": | "3c14b0ae-2159-4452-8e34-5cc9558f376c", | 
| "numberOfGuests" | 4, | 
| "roomTypes": | -|
|"Single":| 0,|
|      "Double":| 2 | 
| "totalPrice": | "2000", | 
| "checkIn": |15 Sep |
| "checkOuts": | 16 Sep |


## Cancel booking: <br>
** DELETE: **  
### Path: /booking{id}
#### Body: empty

#### Response: 
"message": "Booking with id 98d4b6f6-ac33-42f5-be84-26a58038f8c4 has been successfully cancelled"


## Get bookings: <br>
** GET: **  
### Path: /admin/booking
#### Response: 
  the request response lists all bookings including following parts:
| Command | Description |
| --- | --- |
| "bookingId": | "3c14b0ae-2159-4452-8e34-5cc9558f376c", |
| "checkIn": |15 Sep |
| "checkOuts": | 16 Sep |
| "numberOfGuests" | 4, | 
| "roomTypes": | -|
|"Single":| 0,|
|      "Double":| 2 | 
| "totalPrice": | "2000", | 
| "created date": | "11 Sep", | 




## ERROR Message: <br>
#### Number of rooms in a booking > 20:
#### Response: 
"message": "Bokningen överskrider maxantalet av rum (20) för en bokning."<br><br>

#### Number of guests in a booking are more than the available number of beds in the requested room(s):
#### Response: 
"message": "Antalet gäster är fler än tillgängliga sängar  (2) i specifierade rum."<br><br>

#### There are no free rooms at the hotel for the booking request.
#### Response: 
"message": "Not enough rooms available in the Suite room type."<br><br>

#### Cancel a booking < 2 days in advance:
#### Response: 
"message": "You cannot cancel this booking less than 2 days before check-in"<br><br>

    
Se till att du använder ett korrekt id i pathURL:en
