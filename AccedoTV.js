Videos = new Mongo.Collection('videos'); // create DB

if (Meteor.isClient) {

    Session.set("oldSlideIndex", null);
    Session.set("slickSettings", {
            infinite: false,
            speed: 300,
            draggable: false,
            focusOnSelect: true,
            variableWidth: true
        });

    Template.body.events({
        'click .home': function(e) {
            e.preventDefault();
            displayVideosAfterLoad(Videos.find().fetch(), $('.home'));
        },
        'click .history': function(e) {
            e.preventDefault();
            if (Session.get("finishedLoading")) {
                var history = Videos.find({
                    watched: true
                }).fetch();
                displayVideosAfterLoad(history, $('.history'));
                if (history.length === 0) {
                    $('#carousel').prepend('<p class="noHistoryMsg">Of course there is nothing here! You have not viewed any of my videos yet!</p>');
                }
            }
        },
        'click #carousel.manual .slick-active': function(e) {
            onMouseSelectVideo(e, $(e.currentTarget).find('img').data('id'), $(e.currentTarget).find('img').data('video-url'));
        },
        'keypress, keydown #carousel.manual .slick-list': function(e) {
            onKeyboardSelectVideo(e, $(e.currentTarget).find('img').data('id'), $(e.currentTarget).find('.slick-active img').attr('data-video-url'));
        }
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

if (Meteor.isServer) {
    Meteor.startup(function() { // Make AJAX call and then detemine if the DB is empty.  If so then insert items from REST feed
        var response = HTTP.call('GET', 'http://demo2697834.mockable.io/movies', {}),
            data = JSON.parse(response.content);
        console.log('Server started');
        if (Videos.find().count() === 0) {
            console.log('Adding videos');
            for (var i = 0, len = data.entries.length; i < len; i += 1) {
                var entry = data.entries[i],
                    title = entry && entry.title,
                    img = entry && entry.images[0].url,
                    width = entry && entry.images[0].width,
                    height = entry && entry.images[0].height,
                    videoURL = entry && entry.contents[0].url;

                Videos.insert({
                    videoTitle: title,
                    videoImg: img,
                    videoImgWidth: width,
                    videoImgHeight: height,
                    videoURL: videoURL,
                    createdAt: new Date(),
                    watched: false
                });
            }
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
        updateDBtoWatched(id);
    }
}

function onKeyboardSelectVideo(e, id, videoURL) {
    var $currentVideo = $(e.currentTarget),
        key = e.which || e.keyCode;
    $currentVideo.find('.slick-active .fa').show();
    if (key === 13) { // Return key
        playVideoFullScreen($('video'), videoURL);
        updateDBtoWatched(id);
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

function updateDBtoWatched(id) {
    Videos.update(id, {
        $set: {
            watched: true
        }
    });
}