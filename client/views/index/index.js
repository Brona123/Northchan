Template.index.onCreated(function() {
	let tpl = this;

	tpl.autorun(function() {
		FlowRouter.watchPathChange();
		
		const sectionMatcher = {};
		const sectionOptions = {
			sort : {"currentlyViewing" : -1, "name" : 1},
			limit : Session.get("sectionLimit")
		};
		tpl.subscribe("sections", sectionMatcher, sectionOptions);
		
		const threadMatcher = {};
		const threadOptions = {
			sort : {"currentlyViewing" : -1, "sortableTime" : -1},
			calculateLimit : { threadsPerSection : 6 }
		};
		tpl.subscribe("threads", threadMatcher, threadOptions);

		const messageMatcher = {};
		const messageOptions = {
			fields : {threadId : 1}
		}
		tpl.subscribe("messages", messageMatcher, messageOptions);		
	});

	let scrollEvent = Meteor.Device.isDesktop() ? "scroll" : "touchMove";
	
	$(window).bind(scrollEvent, function(){
		const scroll = $(this).scrollTop();

		if($(window).scrollTop() + $(window).height() == $(document).height()) {
			console.log(Session.get("sectionLimit"));
			console.log(Sections.find().count());
	        if (Session.get("sectionLimit") <= Sections.find().count()) {
	        	console.log("increasing section limit");
	        	Session.set("sectionLimit", Session.get("sectionLimit") + 5);
	        }
	    }
	});
});

Template.index.onRendered(() => {
	Session.set("sectionId", "");
	Session.set("threadId", "");
	Session.set("sectionLimit", 5);
});

// TODO infinite scroll

Template.index.helpers({
	sections() {
		if (Session.get("settings").reactive) {
			return Sections.find({}, {sort : {"currentlyViewing" : -1, "name" : 1}, limit : Session.get("sectionLimit")});
		} else {
			return Sections.find({}, {sort : {"name" : 1}});			
		}
	},
	messagesPerSection(section) {
		const threadIds = Threads
							.find({"sectionId" : section._id})
							.map((thread) => { return thread._id });

		return Messages.find({"threadId" : {$in : threadIds}}).count();
	},
	threadsPerSection(section) {
		return Threads.find({"sectionId" : section._id}).count();
	},
	frontPageThreads(sectionId) {
		const threadAmount = Meteor.Device.isDesktop() ? 6 : 3;
		
		return Threads.find({"sectionId" : sectionId}
							, {sort : {"currentlyViewing" : -1, "sortableTime" : -1}
								, limit : threadAmount});
	},
	bgImg(section) {
		return `background-image:url(${Sections.findOne(section._id).background})`;
	},
	totalSections() {
		return Sections.find().count();
	},
	totalThreads() {
		return Threads.find().count();
	},
	totalMessages() {
		return Messages.find().count();
	}
});

Template.index.events({
	'submit #createSubsection': (e, t) => {
		e.preventDefault();

		const sectionName = $("input[name='sectionName'").val().trim();

		const sectionObject = {
			name : sectionName
		}

		if (!Sections.findOne({"name" : sectionName})) {
			
			if ($("input[name='file']").prop('files') && $("input[name='file']").prop('files')[0]) {
				const file = $("input[name='file']").prop('files')[0];

				uploadFile(file, (properFileDownloadUrl) => {
					sectionObject.background = properFileDownloadUrl;

					Meteor.call("createSection", sectionObject);
				});
				
			} else {
				Meteor.call("createSection", sectionObject);
			}
		} else {
			alert(`Section with name \"${sectionName}\" already exists`);
		}

		const form = $("#createSubsection")[0];
		$("#createSubsection")[0].blur();
		form.reset();
	},
	'click button[name="deleteSection"]': (e, t) => {
		e.preventDefault();

		const sectionId = $(e.target).attr("data-section-id");
		Sections.remove(sectionId);
	}
});