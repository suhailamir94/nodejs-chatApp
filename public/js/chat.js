var socket = io(); // open connection to server
var scrollToBottom=function(){
//Selecltors
var messages=jQuery('#messages');
var newMessage = messages.children('li:last-child');
//Heights
var clientHeight=messages.prop('clientHeight');
var scrollTop=messages.prop('scrollTop');
var scrollHeight=messages.prop('scrollHeight');
var newMessageHeight=newMessage.innerHeight();
var lastMessageHeight = newMessage.prev().innerHeight();

if(clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight)
{
    messages.scrollTop(scrollHeight);
}


}
//fired when server is connected
socket.on('connect',function(){

var params = jQuery.deparam(window.location.search);
socket.emit('join',params,function(err){

    if(err){
        alert(err);
    window.location.href='/';
    }
    else{
    console.log('no error!')
    }
});

});

// fired when server is disconnected
socket.on('disconnect',function(){

console.log('Client disconnected!!');
});

socket.on('updateUsersList',function(users){
var ol=jQuery('<ol></ol>');

users.forEach(function(user){
    ol.append(jQuery('<li></li>').text(user));
});
jQuery('#users').html(ol);
    console.log('users List',users);
})
socket.on('newMessage',function(msg){

    console.log('New Msg Arrived!!',msg);
    var formatedTime= moment(msg.createdAt).format('h:mm:a');
    var template=jQuery('#message-template').html();
    var html=Mustache.render(template,{
        text:msg.text,
        from:msg.from,
       createdAt:formatedTime 
    })
    // var li=jQuery('<li></li>');
    // li.text(`${msg.from} ${formatedTime}: ${msg.text}`);

    jQuery('#messages').append(html);
    scrollToBottom();
});

jQuery('#message-form').on('submit',function(e){
    e.preventDefault();
    var messageTextBox=jQuery('[name=message]');
    socket.emit('createMessage',{text:messageTextBox.val()
},function(){
messageTextBox.val('');
    });
});



