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

    function nonEmpty(x){return x.value.length > 0}

    function validate(x){
        if($(x.target).attr("type")=="checkbox"){
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
        } else {
            return {field : x.target.attr("name"), value : x.value};}
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

        var count = Object.keys(person).length;
        var percentage = count/$("[for='control']")  .length * 100 >> 0;
        $("#progressReady").css("width",percentage+"%");

        if(percentage){
            $("#progressBar").show();
        }else{          
            $("#progressBar").hide();
        }

        console.log(person);
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
            inputsReady = [];

        var submitButtonEnabled, 
            professions = {};

        var professionsCollect = $(".spec").asEventStream("change").map(validate).map(consolidate);
        var checkboxFilled = professionsCollect.map(nonEmpty);

        professionsCollect.onValue(collect);

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

        submitButtonEnabled = submitButtonEnabled.and(checkboxFilled);
        submitButtonEnabled.onValue(function(e){
            if(e){
                $("#submit").show();    
            }else{
                $("#submit").hide();
            }
        });
    }

});