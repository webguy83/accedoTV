if (Meteor.isClient) {

	Session.set("oldSlideIndex", null);
    Session.set("slickSettings", {
        infinite: false,
        speed: 300,
        draggable: false,
        focusOnSelect: true,
        variableWidth: true
    });

	Template.carousel.onRendered(function() {
	    // Init Render
	    var loop = setInterval(function() {
	        if (Videos.find().count() !== 0) {
	            setTimeout(function() {
	                clearInterval(loop);
	                $('#carousel').fadeIn(500);
	                $('#carousel').slick(Session.get("slickSettings"));
	                Session.set("oldSlideIndex", $('.slick-active').index());
	                Session.set("finishedLoading", true);
	            }, 500);
	        }
	    }, 200);
	});

	Template.carousel.helpers({
	    videos: function() {
	        $('nav a').removeClass('selected');
	        $('.home').addClass('selected');
	        return Videos.find();
	    }
	});

	Template.carousel.events({
	    'click .slick-active': function(e) {
	        onMouseSelectVideo(e, this._id, this.videoURL);
	    },
	    'ended video': function() {
	        $('video').get(0).webkitExitFullScreen();
	    },
	    'keypress, keydown .slick-active': function(e) {
	        onKeyboardSelectVideo(e, $(e.currentTarget).find('.slick-active img').data('id'), $(e.currentTarget).find('.slick-active img').attr('data-video-url'));
	    }
	});
}

// helper functions
function onMouseSelectVideo(e, id, videoURL) {
    if ((Session.get("oldSlideIndex") !== $(e.currentTarget).index())) {
        $('.slick-active .fa').show(); // display the play icon
        Session.set("oldSlideIndex", $(e.currentTarget).index());
    } else {
        $('.slick-active .fa').show();
        playVideoFullScreen($('video'), videoURL);
        Meteor.call("updateDBtoWatched", id);
    }
}

function onKeyboardSelectVideo(e, id, videoURL) {
    var $currentVideo = $(e.currentTarget),
        key = e.which || e.keyCode;
    $currentVideo.find('.slick-active .fa').show();
    if (key === 13) { // Return key
        playVideoFullScreen($('video'), videoURL);
        Meteor.call("updateDBtoWatched", id);
    }
}

function displayVideosAfterLoad(videoList, $section) {
    $('nav a').removeClass('selected');
    $section.addClass('selected');
    $('#carousel').remove();
    $('nav').after("<div id='carousel' class='manual'></div>");

    $.each(videoList, function() {
        $('#carousel').append("<div><div class='videoWrapper'><i class='fa fa-youtube-play fa-5x'></i><img src=" + this.videoImg + " width=" + this.videoImgWidth + " height=" + this.videoImgHeight + " data-ID=" + this._id + " data-video-URL=" + this.videoURL + " /><p>" + this.videoTitle + "</p></div>");
    });
    $('#carousel').slick(Session.get("slickSettings"));
    $('#carousel').show();
}

function playVideoFullScreen($video, url) {
    $video.attr('src', url);
    $video.get(0).webkitRequestFullscreen();
    $video.get(0).play();
    $video.css('display', 'block');
}

Meteor.methods({
    updateDBtoWatched: function(id) {
        Videos.update(id, {
            $set: {
                watched: true
            }
        });
    }
});