# FE23_PowerRangers - Amanda Cyrus, Solveig Béen, Baran 

## Make a room reservation: <br>
** POST: **  
### Path: /booking
#### Body: Innanför måsvingar ska detta stå:

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


## Cancel a booking(with parameter at least 2 days before booked date)
** DELETE ** 
### Path: /booking/{id}
#### Body: empty

