Template.message.events({
	'submit #messageForm': function (event) {
		event.preventDefault();
		var msg = event.target.message.value;

		Messages.insert({"message" : msg});
	},
	'change #fileUpload': function(event, template) {
		FS.Utility.eachFile(event, function(file) {
	        Files.insert(file, function (err, fileObj) {
	          	if (err){
	            	
	          	} else {
	            	console.log("File upload done!");
	          	}
	        });
	    });
	},
	'dropped #filedrop': function(e, t) {
		e.preventDefault();

		console.log("FILE DROPPED");

		FS.Utility.eachFile(event, function(file) {
			console.log(file);
	        Files.insert(file, function (err, fileObj) {
	        	console.log('Inserted file ');
	        	console.log(fileObj);
	        });
	    });
	},
	'click .fileref': function(e, t) {
		e.preventDefault();

		let id = $(e.currentTarget).attr('id');
		let file = Files.findOne(id);

		let controller = Iron.controller();
		controller.render("content", {to : "content"
									, data : function(){ return file; }});
		
	}
});

Template.message.helpers({
	'messages' : function () {
		return Messages.find().fetch();
	},
	'files' : function () {
		console.log(Files.find().fetch());
		return Files.find().fetch();
	},
	'log' : function(data) {
		console.log(data);
	}
});

var canvas;
var ctx;
var lines = {x : [], y : []};
var lineCounter = 0;

Template.canvas.onRendered(function function_name(argument) {
	canvas = document.getElementById("drawingBoard");
	ctx = canvas.getContext("2d");
});

Template.canvas.events({
	'mousedown #drawingBoard': (event) => {
		let coord = getCursorPosition(canvas, event);
		ctx.moveTo(coord.x, coord.y);

		lines.x.push(coord.x);
		lines.y.push(coord.y);
	},
	'mousemove #drawingBoard': (event) => {
		if (event.buttons === 1) {
			let coord = getCursorPosition(canvas, event);
			ctx.lineTo(coord.x, coord.y);
			ctx.stroke();

			lines.x.push(coord.x);
			lines.y.push(coord.y);
		}
	},
	'mouseup #drawingBoard': (event) => {
		Canvas.insert({data : lines});
		lines.x = [];
		lines.y = [];
	},
	'click #clearCanvas': (event) => {
		Meteor.call("canvasRemove");
	}
});

Template.canvas.helpers({
	'canvasData' : () => {
		let lines = Canvas.find().fetch();

		if (lines.length === 0 && ctx) {
			canvas.width = canvas.width;
			lines.x = [];
			lines.y = [];
		}

		lines.forEach(function(line, index, array) {

			for (var i = 0; i < line.data.x.length; i++) {
				if (i === 0) {
					ctx.moveTo(line.data.x[0], line.data.y[0]);
				} else {
					ctx.lineTo(line.data.x[i], line.data.y[i]);
				}
			}
			ctx.stroke();
		});
		
		return Canvas.find();
	}
})

function getCursorPosition(canvas, event) {
	var x, y;

	canoffset = $(canvas).offset();
	x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(canoffset.left);
	y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(canoffset.top) + 1;

	return {x : x, y : y};
}

Template.content.helpers({
	'data': function() {
		console.log(this);
		return this;
	},
	'isImage' : function(type) {
		return (type === "image/png" || type === "image/jpeg");
	},
	'isVideo' : function(type) {
		return type === "video/mp4";
	},
	'isAudio' : function(type) {
		return type === "audio/mp3";
	},
	'isText' : function(type) {
		return type === "text/plain";
	}
});