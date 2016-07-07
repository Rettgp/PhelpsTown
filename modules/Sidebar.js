/**
 * Created by Garrett on 3/1/2015.
 */
$(document).ready(function () {
  var trigger = $('.hamburger'),
      overlay = $('.overlay'),
      timer = $(".night-timer"),
     isClosed = false;

    trigger.click(function () {
      hamburger_cross();
    });

    function hamburger_cross() {

        if (isClosed == true) {
            overlay.hide();
            trigger.removeClass('is-open');
            trigger.addClass('is-closed');
            timer.removeClass('is-open');
            timer.addClass('is-closed');
            isClosed = false;
        } else {
            overlay.show();
            trigger.removeClass('is-closed');
            trigger.addClass('is-open');
            timer.removeClass('is-closed');
            timer.addClass('is-open');
            isClosed = true;
        }
    }

  $('[data-toggle="offcanvas"]').click(function () {
        $('#wrapper').toggleClass('toggled');
  });
});