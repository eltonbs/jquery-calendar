var eventsStorage = localStorage.events;

var events = [];
if (eventsStorage) {
    events = JSON.parse(eventsStorage);
}

$(function() {
    $('#calendar').fullCalendar({
        editable: true,
        dayClick: dayClick,
        eventClick: eventClick,
        timeFormat: 'HH:mm',
        displayEventEnd: true,
        events: function(start, end, timezone, callback) {
            callback(events);
        },
        eventRender: function(eventObj, $el) {
            $el.popover({
              title: eventObj.title,
              content: eventObj.description,
              trigger: 'hover',
              placement: 'top',
              container: 'body'
            });
        },
    });

    $('#start-picker').datetimepicker({
        allowInputToggle: true,
        format: 'HH:mm'
    });

    $('#end-picker').datetimepicker({
        allowInputToggle: true,
        format: 'HH:mm'
    });

    $("#form-time-start").inputmask({
        alias: "datetime",
        inputFormat: "HH:MM",
        showMaskOnHover: false,
        clearMaskOnLostFocus: false,
    });

    $("#form-time-end").inputmask({
        alias: "datetime",
        inputFormat: "HH:MM",
        showMaskOnHover: false,
        clearMaskOnLostFocus: false,
    });
});

function getEvents() {
    return events;
}

function dayClick(date, jsEvent, view) {
    today = moment.utc().startOf('day');

    if (date < today) {
        return;
    }
    
    clearForm();
    $('#form-id').val(null);
    $('#form-date').val(date.format('YYYY-MM-DD'));
    $('#event-modal-label').text("New appointment: " + date.format('MMMM Do YYYY'));
    $('#confirm-delete-button').addClass('d-none');
    $('#event-modal').modal('show');
}

function eventClick(calEvent, jsEvent, view) {
    clearForm();
    fillForm(calEvent);
    $('#event-modal-label').text("Edit appointment: " + calEvent.start.format('MMMM Do YYYY'));
    $('#confirm-delete-button').removeClass('d-none');
    $('#event-modal').modal('show');
}

$('#event-form').on('submit', function(e) {
    e.preventDefault();
    var event = getEventData($('#event-form'));

    if (!eventIsValid(event)) {
        return;
    }

    // new event
    if (!event.id) {
        event.id = generateId();
    } else {
        // remove event to add updated event
        events = events.filter(function(item) {
            return item.id !== event.id;
        });
    }

    events.push(event);
    localStorage.events = JSON.stringify(events);

    $('#calendar').fullCalendar('refetchEvents');
    $('#event-modal').modal('hide');
});

$('#confirm-delete-button').on('click', function(){
    $('#event-modal').modal('hide');
    $('#confirm-delete-modal').modal('show');
});

$('#delete-button').on('click', function(){
    $('#confirm-delete-modal').modal('hide');
    var event = getEventData($('#event-form'));
    deleteEvent(event);
});

$('#cancel-delete-button').on('click', function(){
    $('#event-modal').modal('show');
});

function getEventData($form) {
    var dataArray = $form.serializeArray();
    var data = {};

    jQuery.each(dataArray, function(i, item) {
        data[item.name] = item.value;
    })

    return {
        "id": data.id,
        "title": data.title,
        "description": data.description,
        "start": data.date + 'T' + data.startTime + ':00',
        "end": data.date + 'T' + data.endTime + ':00'
    }
}

function deleteEvent(event) {
    events = events.filter(function(item) {
        return item.id !== event.id;
    });

    localStorage.events = JSON.stringify(events);
    $('#calendar').fullCalendar('refetchEvents');
    clearForm();
}

function eventIsValid(event) {
    if (event.start > event.end) {
        $('#form-alert-text').text('The End time must be greater than the Start time.');
        $('#form-alert').removeClass('d-none');
        return false;
    }

    var overlaps = events.filter(function(item){
        // ignores comparition with himself
        if (item.id === event.id) {
            return false;
        }

        if (
            (item.start <= event.start && item.end >= event.end) ||
            (item.start >= event.start && item.start <= event.end) ||
            (item.end >= event.start && item.end <= event.end)
        ) {
            return true;
        }
    });

    if (overlaps.length > 0) {
        $('#form-alert-text').text('This appointment overlaps with another appointment.');
        $('#form-alert').removeClass('d-none');
        return false;
    }

    $('#form-alert').addClass('d-none');
    return true;
}

function clearForm() {
    document.getElementById("event-form").reset();
    $('#form-alert').addClass('d-none');
}

function fillForm(event) {
    $('#form-id').val(event.id);
    $('#form-title').val(event.title);
    $('#form-description').val(event.description);
    $('#form-data').val(event.start.format('YYYY-MM-DD'));
    $('#form-time-start').val(event.start.format('HH:mm'));
    $('#form-time-end').val(event.end.format('HH:mm'));
}

function generateId(){
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5) + Math.random().toString(36).substr(2, 5);
}