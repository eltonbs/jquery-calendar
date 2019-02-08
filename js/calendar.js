var events = [
    {
      title: 'All Day Event',
      start: '2019-01-01'
    },
    {
      title: 'Long Event',
      start: '2019-01-07',
      end: '2019-01-10'
    },
    {
      title: 'Conference',
      start: '2019-01-11',
      end: '2019-01-13'
    },
    {
      title: 'Meeting',
      start: '2019-01-12T10:30:00',
      end: '2019-01-12T12:30:00'
    }
];

$(function() {
   $('#calendar').fullCalendar({
       events: events
   }); 
});