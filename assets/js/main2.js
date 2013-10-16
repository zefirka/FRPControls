$(document).ready(function(){

var info = {};

//предикат 
function value(x){
    var $x = $(x.target);
    var $xType = $x.attr("type");

    if($xType=="checkbox"){
        return { field : $x.attr("data"), value : $x.prop("checked") ? $x.attr("name") : ""}
    }else
    if($xType=="radio"){
        return { field : $x.attr("name"), value : $x.val()}
    }
    else
    {
        return { field : $x.attr("name"), value : $x.val() };
    }
}

function notEmpty(x){
    return x.value.length ? true : false;
}

function collect(x){
    console.log(x);
}

var username = $("input[name='username']").asEventStream("keyup").map(value)  
var password = $("input[name='password']").asEventStream('keyup').map(value)
var email = $("input[name='email']").asEventStream('keyup').map(value)

var service = $(".service").asEventStream("change").map(value);
var shape = $("input[name='shape'").asEventStream("change").map(value);

var input = username.merge(password).merge(email).merge(service).merge(shape);

var progressBarEnabled = input.onValue(collect);

var submitButtonEnabled = username.map(notEmpty).toProperty().
                                and(email.map(notEmpty)).
                                and(password.map(notEmpty)).
                                and(service.map(notEmpty)).
                                and(shape.map(notEmpty)).onValue(function(x){
    x ? $("#submit").show() : $("#submit").hide();
})


});