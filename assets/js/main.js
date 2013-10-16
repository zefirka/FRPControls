$(document).ready(function(){

    //  Здесь мы будем хранить введенные данные, чтобы в дальнейшем пользоваться ajax-запросами
    var person = {
        professions : {}
    }

    //Инициализируем функционал кнопки "скрыть"
    initHide();
    
    // Инициализируем все
    initControls();


    function textFieldValue(textField) {
        function value() { 
            return {
                value : textField.val(),
                target : textField
                } 
        }
        return textField.asEventStream("keyup").map(value)
    }

    function nonEmpty(x){
        return x.value.length > 0
    }

    function validate(x){
        var type = $(x.target).attr("type");
        if(type=="checkbox"){
            var pos =  $(x.target).prop("checked"); 
            if(pos){
                person.professions[$(x.target).attr("name")] = "true";
                return { field : "profession", value : person.professions};
            }else{
                if(person.professions.hasOwnProperty(($(x.target).attr("name")))){
                    delete person.professions[$(x.target).attr("name")];
                }
                return {field: "profession" , value : person.professions};
            }
        } else
        if(type=="radio"){
            return {field : $(x.target).attr("name"), value : $("[for='"+$(x.target).attr("id")+"']", $(x.target).parent()).text()}
        }
        else {
            return {field : x.target.attr("name"), value : x.value};
        }
    }

    function consolidate(x){
        var e = "", c =0;
        for(var i in x.value){
            e += " " + i;
            c++;
            var t = $("input[type='checkbox']", $("#"+i).parent());
            
            if(c==3){
                t.each(function(){
                    if(!$(this).prop("checked")){
                        $(this).attr("disabled", "disabled");
                    }
                })
            }else{
                t.each(function(){
                    $(this).prop("disabled", "");                    
                })
            }
        }

        x.value = e;
        return x;
    }

    function collect(e){
        person[e.field] = e.value;

        if(!e.value.length ){
            delete person[e.field];
        }

        var count = Object.keys(person).length-1;
        var percentage = count/$("[for='control']").length * 100 >> 0;
        $("#progressReady").css("width",percentage+"%");

        if(percentage){
            $("#progressBar").show();
        }else{          
              $("#progressBar").hide();
        }

        //console.log(person);
    }

    function initHide(){
        var hiding = $(".hide").asEventStream("change").map(function(x){
                return {
                    name : $(x.target).attr("name"),
                    checked : $(x.target).prop("checked")
                }
            }).toProperty(false); 

        var fieldIsHided = hiding.map(function(x){
            return {
                object : $(".hided" , $("#"+x.name).parent()),
                val : x.checked
            }
        });

        fieldIsHided.onValue(function(x){
            x.val ? x.object.show() : x.object.hide();
        });
        return 0;
    }
    

    function initControls(){  
        var globalInputs = $("input[type='text']"), 
            inputs = [], 
            inputsEntered = [], 
            inputsReady = [],
            radioButtons = [];

        var submitButtonEnabled, 
            professions = {};

        //Чекбоксы
        var professionsCollect = $(".spec").asEventStream("change").map(validate).map(consolidate);
        var checkboxFilled = professionsCollect.map(nonEmpty);
        professionsCollect.onValue(collect);

        //Инпуты
        for(var i=0;i<globalInputs.length;i++){
            var catr = $(globalInputs[i]).attr("name");
            inputs.push(textFieldValue($("#" + catr)));

            inputsEntered[i] = inputs[i].toProperty().map(nonEmpty);     
            inputsReady[i] = inputs[i].map(validate).onValue(collect);

            if(i){
                submitButtonEnabled = submitButtonEnabled.and(inputsEntered[i]);
            } else {
                submitButtonEnabled = inputsEntered[i];           
            }
        }

        //Ajax для инпута номер 0 (оно же "name")
        var inputsAvailabilityRequest = inputs[0].toProperty().changes().filter(nonEmpty).skipDuplicates().throttle(300)
            .map(function(user){
                return { 
                    url : "check.php",
                    type: "post",
                    dataType: "text",
                    data: ({"field" : user.target.attr("name"), "value" : user.value})
                }
            });
        var inputsAvailabilityResponse = inputsAvailabilityRequest.ajax();
        var inputAvailabale = inputsAvailabilityResponse.toProperty("start");
        var submitAvailable = inputsAvailabilityResponse.toProperty("start").map(function(x){
            if(x=="0\n"){
                return true;
            }else{
                return false;
            }
        })
        inputAvailabale.onValue(function(x){
            console.log(x);
            if(x=="start"){
                $(".ajax").hide();
            } else 
            if(x==0){
                $(".ajax").css({
                    "display":"inline-block",
                    "background-color":"#70CA33"});
            } else {
                $(".ajax").css({
                    "display":"inline-block",
                    "background-color":"#AE4A43"});
            }
        });

        ajaxVisible = inputsEntered[0].onValue(function(x){
            if(!x){ 
                $(".ajax").hide();
            }
        });


        //источник данных радиобаттонов
        var radioButtonsObject = function() {
            var btns =  $("input[type='radio']");
            var result = [];
            var last = "";
            for(var i = 0; i <btns.length; i++){
                var name = $(btns[i]).attr("name");

                if( name != last){
                    result.push(name);
                }
                last = name;
            }
            return result;
        }

        var radioTmp = radioButtonsObject(), radioButtonsCheked = [];

        for(var i=0;i<radioTmp.length;i++){
            radioButtons[i] = $("input[name='"+radioTmp[i]+"']").asEventStream("change").map(validate);
            radioButtonsCheked[i] = radioButtons[i].map(nonEmpty);
            radioButtons[i].onValue(collect);         
      
            submitButtonEnabled = submitButtonEnabled.and(radioButtonsCheked[i]);
        }

        //Кноппка submit
        submitButtonEnabled = submitButtonEnabled.and(checkboxFilled).and(submitAvailable);
        submitButtonEnabled.onValue(function(e){
            if(e){
                $("#submit").show();    
            }else{
                $("#submit").hide();
            }
        });
    }

    var submitClick = $("#submit").asEventStream("click").onValue(function(x){
        x.preventDefault();
        console.log(person);
    })

});