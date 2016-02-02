'use strict';

var floor;
if ($('body.floor1').length) {
    floor = 1;
} else if ($('body.floor2').length) {
    floor = 2;
}

Date.prototype.yyyymmdd = function() {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth() + 1).toString();
    var dd = this.getDate().toString();
    return yyyy + (mm[1] ? mm : '0' + mm[0]) + (dd[1] ? dd : '0' + dd[0]);
};

var date = new Date().yyyymmdd();

// code for display
if ($('.desk-map').length) {

    var dateToday = new Date();

    var dateOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };

    var updateDate = function() {
        $('.dateToday').html(dateToday.toLocaleTimeString('en-EN', dateOptions));
        setTimeout(updateDate, 60000);
    };

    updateDate();


    var tagBody = '(?:[^"\'>]|"[^"]*"|\'[^\']*\')*';

    var tagOrComment = new RegExp(
        '<(?:!--(?:(?:-*[^->])*--+|-?)|script\\b' + tagBody + '>[\\s\\S]*?</script\\s*|style\\b' + tagBody + '>[\\s\\S]*?</style\\s*|/?[a-z]' + tagBody + ')>', 'gi');

    var removeTags = function(html) {
        var oldHtml;
        do {
            oldHtml = html;
            html = html.replace(tagOrComment, '');
        } while (html !== oldHtml);
        return html.replace(/</g, '&lt;');
    };

    // var password;

    var flexDesk = new Firebase('https://vivid-fire-9764.firebaseio.com/flex/' + date + '/' + floor + '/');

    flexDesk.on('child_added', function(snapshot) {
        var position = snapshot.name();
        flexDesk.child(snapshot.name()).on('value', function(snapshot) {
            var memberName = snapshot.val().name,
                memberInfo = snapshot.val().info || '',
                memberCompany = snapshot.val().company || '';
            memberInfo = removeTags(memberInfo);
            memberName = removeTags(memberName);
            memberCompany = removeTags(memberCompany);
            $('#desk' + (position)).empty();
            $('#desk' + (position)).append(
                '<div class="flex-name text-center animated bounceIn">' +
                memberName +
                '</div>' +
                '<div class="flex-company text-center">' +
                memberCompany + '</div>' +
                '<div class="flex-info">' +
                memberInfo +
                '</div>');
        });

    });

    // refresh the page on a new day

    setInterval(function() {
        var now = new Date().getDate();
        if (now !== dateToday.getDate()) {
            location.reload();
        }
    }, 3600000);

}


// code for signin
if ($('.flex-signin').length) {

    var dateToday = new Date();

    setInterval(function() {
        var now = new Date().getDate();
        if (now !== dateToday.getDate()) {
            location.reload();
        }
    }, 3600000);

    var countChar = function(val) {
        var len = val.value.length;

        if (len >= 50) {
            val.value = val.value.substring(0, 50);
        }
    };

    // populate the field with saved localStorage info
    if (localStorage.getItem('TechHubFlexCheckin')) {
        var savedInfo = JSON.parse(localStorage.getItem('TechHubFlexCheckin'));
        $('#member_name').val(savedInfo.name);
        $('#member_company').val(savedInfo.company);
    }

    countChar($('#member_info').get(0));
    $('#member_info').keyup(function() {
        countChar(this);
    });

    var flexCheckin = new Firebase('https://vivid-fire-9764.firebaseio.com/flex/' + date + '/' + floor + '/'),
        flexHistory = new Firebase('https://vivid-fire-9764.firebaseio.com/flex/data/'),
        desk = 0;

    $('.btn-check1').on('click', function(e) {
        e.preventDefault();
        if ($('#member_name').val().length > 0) {
            $('#member_name').closest('.form-group').removeClass('has-error');
            $('.help-block').addClass('hidden');
            $('.btn-check1').tab('show');
        } else {
            $('#member_name').closest('.form-group').addClass('has-error');
            $('.help-block').removeClass('hidden').html('Please insert your name');
        }
    });

    $('.tab-pane#map').css('min-height', $(window).height());

    $('.btn-desk').on('click', function(e) {
        e.preventDefault();
        desk = $(this).data('desk');
        $('.signin-desk-number').html(desk);
        $('#desk_position').val(desk);
        var memberInfo = $('#member_info').val(),
            memberName = $('#member_name').val(),
            memberCompany = $('#member_company').val(),
            now = new Date().getTime();
        flexCheckin.child(desk).set({
            'name': memberName,
            'info': memberInfo,
            'company': memberCompany
        });
        flexHistory.push({
            'date': now,
            'floor': floor,
            'name': memberName,
            'info': memberInfo,
            'company': memberCompany,
            'desk': desk
        });
        localStorage.setItem('TechHubFlexCheckin', JSON.stringify({
            'name': memberName,
            'info': memberInfo,
            'company': memberCompany
        }));
        $(this).tab('show');
        if ($('body.tablet').length) {
            window.setTimeout(function() {
                location.reload();
            }, 2500);

            $('#btn-refresh').on('click', function(e) {
                e.preventDefault();
                window.location.reload();
            });
        }
    });

}
