var socket = io();

function scrollToBottom(){
    //selectors
    var messages = jQuery('#messages');
    var newMessage = messages.children('li:last-child');
    //Heights
    var clientHeight = messages.prop('clientHeight');
    var scrollTop = messages.prop('scrollTop');
    var scrollHeight = messages.prop('scrollHeight');
    //height of last list item
    var newMessageHeight = newMessage.innerHeight();
    //height of second last list item
    var lastMessageHeight = newMessage.prev().innerHeight();
    if(clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight){
        messages.scrollTop(scrollHeight);
    }
    
}

socket.on('connect',function(){
   //console.log("connected to server");
   var params = jQuery.deparam(window.location.search);
   socket.emit('join',params,function(err){
       if(err){
        alert(err);
        window.location.href = '/';
       }
       else{
        console.log('No error');
        }
   });
});

socket.on('disconnect',function(){
    console.log('disconnected from server');
});

socket.on('updateUserList',function(users){
    var ol = jQuery('<ol></ol>');
    users.forEach(function(user){
       ol.append(jQuery('<li></li>').text(user));
    });
    jQuery('#users').html(ol);
});

socket.on('newMessage',function(message){
    var formattedTime =moment(message.createdAt).format('h:mm a');
    var template = jQuery('#message-template').html();
    var html = Mustache.render(template,{
        text:message.text,
        from:message.from,
        createdAt:formattedTime
    });
    jQuery('#messages').append(html);
    scrollToBottom();
  
});


jQuery('#message-form').on('submit',function(e){
    e.preventDefault();
    var messageTextbox = jQuery('[name=message]');
    socket.emit('createMessage',{
    
        text: messageTextbox.val()
    },function(){
        messageTextbox.val('')
    });
});

var locationButton = jQuery('#send-location');
locationButton.on('click',function(){
 if(!navigator.geolocation){

    return alert('geolocation not supported by the user');

   }

    locationButton.attr('disabled','disabled').text('sending location...');
   navigator.geolocation.getCurrentPosition(function(position){
      locationButton.removeAttr('disabled').text('send location');
     socket.emit('createLocationMessage',{
         latitude: position.coords.latitude,
         longitude: position.coords.longitude
            });
     },function(){
     alert('unable to fetch location');
     },{timeout:10000});
});

socket.on('newLocationMessage',function(message){
    var formattedTime =moment(message.createdAt).format('h:mm a');
    var template = jQuery('#location-message-template').html();
    var html = Mustache.render(template,{
        url:message.url,
        from:message.from,
        createdAt:formattedTime
    });
    jQuery('#messages').append(html);
    scrollToBottom();
});











