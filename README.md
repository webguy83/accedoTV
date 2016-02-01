# AccedoTV
A project build for AccedoTV (http://www.accedo.tv/)

Project server URL can be found here: http://accedotv.meteor.com/ and the project requirements are found in project.docx.

Some notes on the project:

* single page app created using MeteorJS (https://www.meteor.com)
* the server of choice I used was MongoDB (NoSQL)
* built to be used in Google Chrome
* technology used was all JavaScript(Jquery) with Blaze template engine for the view
* HTTP.call package used for AJAX request
* SlickJS (http://kenwheeler.github.io/slick/) was used for the image carousel

To set up the project, please install meteor on your local machine. It's very easy and takes just a couple minutes with instructions here: https://www.meteor.com/install. Upload these files in Git to a folder on your local drive, navigate to it, and then type in: **git meteor** to init everything. Afterwards, type in http://localhost:3000 to see everything in action locally! Additionally if you want to see the database entries you may run: **meteor mongo** in the terminal and run commands such as db.videos.find() to see the data entered. For more information, please read the great documentation available on the website.
