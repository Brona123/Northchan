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