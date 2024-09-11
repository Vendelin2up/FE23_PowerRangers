# FE23_PowerRangers - Amanda Cyrus, Solveig Béen, Baran 


| Anrop       | Route           | Resultat |
| ------------- |:-------------:| -----:|
| POST      | /booking | Bokar rum |
| DELETE    | /booking{id} | Avbokar rum |
| PUT      | /booking{id} | Uppdaterar bokning |
| GET      | /admin/bookings | Ser alla bokade rum |

## Make a room reservation: <br>
** POST: **  
### Path: /booking

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
