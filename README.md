# FE23_PowerRangers - Amanda Cyrus, Solveig Béen, Baran 


| Anrop       | Route           | Resultat |
| ------------- |:-------------:| -----:|
| POST      | /booking | Bokar rum |
| DELETE    | /booking{id} | Avbokar rum |
| PUT      | /booking{id} | Uppdaterar bokning |
| GET      | /admin/bookings | Ser alla bokade rum |

## Make a room reservation: <br>
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

## Cancel booking: <br>
** DELETE: **  
### Path: /booking{id}
#### Body: empty

Se till att du använder ett korrekt id i pathURL:en
