Questions = new Mongo.Collection('questions');

Questions.allow({
  insert: function(userId, doc) {
    return !! userId;
  }
});

Meteor.methods({
  upvote: function(questionId) {
    var question = Questions.findOne(questionId);
    Questions.update(questionId, {
      $inc: {score: 1},
      $addToSet: {votes: Meteor.userId()}
    });
  }
});

if (Meteor.isClient) {
  
  Meteor.subscribe('questions');
  
  Template.questionsList.helpers({
  	questions: Questions.find({}, {sort: {score: -1}}), 
  });
  
  Template.questionsList.events({
    'click .vote-up': function(e) {
      e.preventDefault();
      Meteor.call('upvote', this._id);
    }
  });
  
  Template.questionForm.events({
    'submit form': function(e) {
      e.preventDefault();
      var textarea = $(e.target).find('#question');
      if(textarea.val().trim() == '') {
        return false;
      }
      Questions.insert({
        'text': textarea.val(),
        'score': 0,
        'votes': [Meteor.userId()],
        'user': Meteor.user().emails[0].address,
      });
      textarea.val('');
    }
  });

  Template.questionsList.helpers({
    canVote: function (){
      return  Meteor.user() && 
        ! _.contains(this.votes, Meteor.userId());
    }
  });
}

if (Meteor.isServer) {

  if (Questions.find().count() === 0) {
    Questions.insert({
    	text: 'What is the answer to life, the universe and everything?',
    	score: 0,
      votes: [],
      user: 'successive@ama.com'
    });
  
    Questions.insert({
  		text: 'Do you know kung-fu?',
  		score: 0,
      votes: [],
      user: 'successive@ama.com'
  	});

    Questions.insert({
      text: 'Where is Jessica Hyde?',
      score: 0,
      votes: [],
      user: 'successive@ama.com'
    });
  
  }

  Meteor.publish('questions', function() {
    return Questions.find();
  });
}
