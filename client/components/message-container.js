let pollChart;
const templateRendered = new ReactiveVar(false);

Template.messageContainer.onCreated(() => {
    templateRendered.set(false);
});

Template.messageContainer.onRendered(() => {
    templateRendered.set(true);
});

Template.messageContainer.helpers({
    finnishDate(date) {
        if (!date) return;

        const pz = prependZero;

        return `${date.getDate()}.${date.getMonth()+1}.${date.getFullYear()} ${pz(date.getHours())}:${pz(date.getMinutes())}:${pz(date.getSeconds())}`;
    },
    styleLikes(likeCount) {
        if (!likeCount) return;

        let elem = $("<span />");

        if (likeCount < 0) {
            elem.addClass("disliked");
            elem.text(likeCount);
        } else if (likeCount > 0) {
            elem.addClass("liked");
            elem.text("+" + likeCount);
        } else {
            elem.text("0");
        }
        
        return elem.prop('outerHTML');
    },
    formatMsg(msg) {
        if (!msg) return;

        const splittedMsg = msg.split("\n");
        let formattedMsg = "";

        splittedMsg.forEach((elem, index, arr) => {
            if (elem.startsWith("<")) {
                formattedMsg += ("<span class='bluetext'> &lt;" 
                                    + elem.substring(1, elem.length) 
                                    + " </span>\n");
            } else if (elem.startsWith(">")) {
                formattedMsg += ("<span class='greentext'> &gt;" 
                                    + elem.substring(1, elem.length)
                                    + " </span>\n");
            } else {
                formattedMsg += elem + "\n";
            }
        });

        const msgWithLinks = formattedMsg.replace(/(?:https?)[^\s]+/g
                                                , "<a href='$&'>$&</a>");
        
        const msgWithTooltips = msgWithLinks.replace(/#\d+/g
                                            , "<a class='reference'"
                                                + " href='$&'>"
                                                + "$&"
                                                + "</a>");

        const msgWithLineBreaks = msgWithTooltips.replace(/\n/g, "<br />");

        return msgWithLineBreaks;
    },
    pollHtml(pollId) {
        renderPollsCanvas(pollId);        
    },
    pollOptions(pollId) {
        const poll = Polls.findOne(pollId);

        if (poll)
            return poll.options;
    },
    votes(pollId) {
        renderPollsCanvas(pollId);

        return Polls.findOne(pollId).alreadyVoted;
    }
});

Template.messageContainer.events({
    'click .rate-up':(e, t) => {
        const msgId = $(e.target).attr("data-msg-id");

        Meteor.call('rateMessageUpsert'
                    , msgId
                    , {$inc : {likes : 1}});
    },
    'click .rate-down':(e, t) => {
        const msgId = $(e.target).attr("data-msg-id");

        Meteor.call('rateMessageUpsert'
                    , msgId
                    , {$inc : {likes : -1}});
    },
    'click .reply':(e, t) => {
        e.preventDefault();

        const msgId = $(e.target).attr("data-msg-id");
        const count = Messages.findOne(msgId).count;
        const textarea = $("textarea[name='msg']");

        textarea.val(`${textarea.val()}#${count}\n`);
        
        if (Meteor.Device.isDesktop()) {
            textarea.focus();
        }
    },
    'click .replies a':(e, t) => {
        const id = $(e.target).attr('href');
        const elem = $(id).get(0);

        elem.scrollIntoView();
    },
    'click .reference':(e, t) => {
        const id = $(e.target).attr('href');
        const elem = $(id).get(0);

        elem.scrollIntoView();
    },
    'mouseenter .reference':(e, t) => {
        displayPopover($(e.target));
    },
    'mouseenter .replies a':(e, t) => {
        displayPopover($(e.target));
    },
    'click .voteBtn':(e, t) => {
        const pollId = $(e.target).attr("data-pollId");
        const option = $("#optionSelection").val();

        Meteor.call("vote", pollId, option);
    },
    'click button[name="deleteMessage"]':(e, t) => {
        const msgId = $(e.target).attr("data-msg-id");
        
        Messages.remove(msgId);
    },
    'click button[name="banUser"]':(e, t) => {
        const id = $(e.target).attr("data-owner-id");
        const msgId = $(e.target).attr("data-msg-id");

        const msgContent = Messages.findOne(msgId).msg;
        const modId = Meteor.userId();

        // TODO UI bannin syyn antamiselle
        const reason = "U're banned!";

        Meteor.call("banUser"
                    , id
                    , "U're banned!"
                    , msgContent
                    , modId);
    },
    'click .resize': (e, t) => {
        const url = $(e.target).attr("data-video-url");
        const elem = $(`video[src='${url}']`);

        elem.toggleClass("maximized");
        elem.prop("controls", !elem.prop("controls"));
        elem[0].pause();
    }
});

function prependZero(str) {
    if (str < 10) {
        return "0" + str;
    } else {
        return str;
    }
}

function displayPopover(target) {
    let msgRef = target.attr('href');
    let count = parseCount(msgRef);
    let msg = Messages.findOne({"count" : count});
    let content = Blaze.toHTMLWithData(Template["messageContainer"], msg).replace(/>\s+</g,'><');

    if (msg) {
        target.popover({
            placement: 'right',
            trigger: 'hover',
            html: true,
            container: 'body',
            content: content
        }).popover('show');
    } else {
        // TODO call method when message not published in thread
        // and referencing it
    }
}

function parseCount(ref) {
    return +ref.match(/\d+/)[0];
}

function renderPollsCanvas(pollId) {
    if (templateRendered.get()) {
        if (!document.getElementById(pollId)) {
            return;
        }
        
        const ctx = document.getElementById(pollId).getContext("2d");

        if (ctx) {
            const poll = Polls.findOne(pollId);

            if (!poll) return;

            const data = [];

            poll.options.forEach((elem, index, array) => {
                data.push({
                    label : elem.option,
                    value : elem.voteCount,
                    color : elem.bgColor
                });
            });

            if (pollChart) {
                pollChart.destroy();
            }

            const options = {
                animation : false,
                tooltipTemplate: "<%= label %> - <%= value %>",
                showToolTips: true,
                onAnimationComplete: function() {
                    this.showTooltip(this.segments, true);
                },
                tooltipEvents: [],
                responsive: true,
                maintainAspectRatio: true
            }

            pollChart = new Chart(ctx).Pie(data, options);
            console.log("RENDERED CHART");
        }
    }
}