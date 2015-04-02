var seatModel = require('../models/game').seat;

exports.createSeatsForGame = function(game, currentUser){
    for(var i = 0; i < game.seats; i++){
        var seat = new seatModel({
            ownerId: currentUser._id
        });
        
        game.seatCollection.push(seat);
    }
}