var gameTemplateModel = require('/models/gameTemplate');

exports.saveGameTemplate = function(templateObject, callback){
  var gameTemplate = new gameTemplateModel(templateObject);
  gameTemplate.save(function(err){
    if(err){
      console.log(err);
    }
    callback(err);
  });
}