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
### Path: /booking/{id}
#### Body: empty
