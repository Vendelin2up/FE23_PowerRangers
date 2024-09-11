# FE23_PowerRangers - Amanda Cyrus, Solveig Béen, Baran 

## Make a room reservation: <br>
** POST: **  
### Path: /booking
#### Body:
{
	"date":"23 Sep",
	"checkIn":"23 Sep",
	"checkOut":"26 Sep",
	"numberOfGuests":"2",
	"roomIds":"2",
	"name":"Ada Lovelace"
}

## Cancel a booking(with parameter at least 2 days before booked date)
** DELETE ** 
### Path: /booking/{id}
#### Body: empty

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
