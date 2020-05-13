var entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&amp;#39;',
    "/": '&#x2F;'
};

//function to try to properly format output and avoid strange symbols
function escapeHtml(string) {
    return String(string).replace(/[&<>"'\/]/g, function (s) {
        return entityMap[s];
        console.log('entityMap: ' + entityMap[s]);
    });
}

//Populates the Language Selection dropdown menus
$.ajax({
    type: "GET",
    url:"/ajax/get_languages/",
    dataType: "json",
    success: function (data) {
        console.log('get_languages: SUCCESS!');
        // console.log(data);
        $.each(JSON.parse(data),function(i,obj) {
            var div_data="<option value="+obj.language+">"+obj.name+"</option>";
            $(div_data).appendTo('#dialog_options');
            $(div_data).appendTo('#translation_options'); 
        });   
    }
});


chat = 0;
translationCount = 0;
var hidden = true;
//Controls output to the chat console
function chat_line() { 
    //Check to make sure languages are selected
    console.log("CHECK IF LANGUAGES SELECTED: ");
    var y = $('#dialog_options option:selected').attr('value');
    var z = $('#translation_options option:selected').attr('value');
    console.log(hidden);

    //Append Warning Statement to the chat area if languages not selected
    if(y=='select' || z == 'select') {
        console.log('WARNING: LANGUAGES NOT SELECTED');
        var footer = document.getElementById("chat_console_footer");
        var p = document.createElement("p");
        p.appendChild(document.createTextNode("Please select languages in left panel."));
        p.setAttribute("id", "languageWarning");
        p.setAttribute("style", "color:red");
        footer.appendChild(p);
        hidden = false;
        console.log(hidden);
    }

    //Remove warning statement if present
    else {
        console.log(hidden);
        if (!hidden){
            console.log("HIDING THE WARNING")
            var warning = document.getElementById("languageWarning");
            warning.hidden = true;
        }
    
        

    //PRINTS USER INPUT TO CHAT CONSOLE
        //Create the text bubble
        var text_bubble = document.createElement("li");
        text_bubble.setAttribute("id", "chat"+chat);
        

        //Create the user text paragraph
        var input =  document.getElementById("btn-input").value; 
        var user_text = document.createElement("p");
        user_text.appendChild(document.createTextNode(input));
        user_text.setAttribute("class", "user_chat_text user_chat");
        user_text.setAttribute("id", "user" + chat);
        user_text.setAttribute("onclick", "show_translation(this)");
        user_text.setAttribute("translated", "false"); 

        //Append the user text to the text bubble
        text_bubble.appendChild(user_text);

        //Append the text bubble to the chat list
        var ul = document.getElementById("chat");
        ul.appendChild(text_bubble);
        document.getElementById(text_bubble.getAttribute('id')).scrollIntoView();
        console.log(ul);
    

    //PRINTS ENTITIES FROM USER INPUT TO ENTITIES LIST
        try{
            $.ajax({
                type: "POST",
                url:"/ajax/get_entities/",
                dataType: "json",
                data: {
                    user_input : input,
                    csrfmiddlewaretoken: '{{ csrf_token }}'
                },
                success: function (data,) {
                    console.log('get_entities = SUCCESS!');

                    //Populate the entity list
                    var count = 1;
                    data.forEach(function(entity) {

                        //Create entity link
                        var a = document.createElement("a");
                        var name =  entity.name; 
                        a.appendChild(document.createTextNode(name));
                        a.setAttribute("target", "_blank");

                        try{ 
                            a.setAttribute("href", entity.metadata.wikipedia_url);

                            //Create entity listing
                            var li = document.createElement("li");
                            li.appendChild(a)
                            li.setAttribute("id", "li"+count);

                            //Append entity listing to entity list
                            var ul = document.getElementById("entity_list");
                            ul.appendChild(li);
                            count++;
                        }
                        catch(error) {
                            console.log('error handled')
                        }
                        
                    });

                    //CONSOLE LOG ENTITY LIST, can comment out below
                    //#############
                    var list = document.getElementById("entity_list");
                    console.log(list)
                    for (; count >0; count--) {
                        var l = document.getElementById("li"+count);
                        console.log(l);
                    }
                    //#############
                }
            });
        }
        catch(error){
            console.log("No entities detected.");
        }

    //Increment chat count
    chat++;
    console.log("chat count: ", chat);

    //If selected Chat Language is not English, translate to english
    console.log("LANGUAGE SELECTED: ");
    console.log(y);
    console.log(z);
    var userInput =  document.getElementById("btn-input").value;
    if(y != "en") {
        //send user input to getEnglish(nonenglish)
        $.ajax({
            type: "POST",
            url: "/ajax/get_english_translation/",
            data: {
                user_input: userInput,
                csrfmiddlewaretoken: '{{ csrf_token }}'
            },
            success: function(data,) {
                console.log("TRANSLATING TO ENGLISH: ");
                console.log(data.translatedText);
                var phrase = data.translatedText;
                get_English(phrase);
            }
        })
    }
    else{
        get_chatbot_reply();
    }
    
    }
}

function get_English(englishText){
    var inputText = englishText;
    var chatbot_response = "";
    //get Chatbot response
    $.ajax({
        type: "POST",
        url:"/ajax/get_chatbot_reply/",
        // dataType: "text",
        data: {
            parent_text : inputText,
            csrfmiddlewaretoken: '{{ csrf_token }}'
        },
        success: function (data,) {
            console.log("GETTING CHATBOT RESPONSE")
            console.log(data)
            chatbot_response = data;

            //translate chatbot response
            var chatLang = $('#dialog_options option:selected').attr('value');
            $.ajax({
                    type: "POST",
                    url: "/ajax/get_nonenglish_translation/",
                    data: {
                        user_input: chatbot_response,
                        langTo : chatLang,
                        csrfmiddlewaretoken: '{{ csrf_token }}'
                    },
                    success: function(data,) {
                        console.log("TRANSLATING TO CHAT LANGUAGE: ");
                        console.log(data.translatedText);
                        text = data.translatedText
                        //Create chatbot text paragraph
                        chatbot_reply = document.createElement("p");
                        chatbot_reply.appendChild(document.createTextNode(text));
                        chatbot_reply.setAttribute("class", "chatbot_chat_text chatbot_text");
                        chatbot_reply.setAttribute("id", "chatbot" + chat);
                        chatbot_reply.setAttribute("onclick", "show_translation(this)");
                        chatbot_reply.setAttribute("translated", "false"); 

                        //Create chatbot text bubble
                        var chatbot_text_bubble = document.createElement("li");
                        chatbot_text_bubble.setAttribute("id", "botchat"+chat);

                        //Append the chatbot text to the chatbot text bubble
                        chatbot_text_bubble.appendChild(chatbot_reply);

                        //Append the chatbot text bubble to the chat list
                        var ul = document.getElementById("chat");
                        ul.appendChild(chatbot_text_bubble);
                        document.getElementById(chatbot_text_bubble.getAttribute('id')).scrollIntoView(); 
                        console.log(ul);
                        
                    }
            })
        }
    });

    
    
}

//PRINT CHATBOT REPLY TO CHAT CONSOLE
function get_chatbot_reply() {
    console.log("CHATBOT")
    var input =  document.getElementById("btn-input").value; 
    console.log(input);
    var chatbot_response = '';

    $.ajax({
        type: "POST",
        url:"/ajax/get_chatbot_reply/",
        // dataType: "text",
        data: {
            parent_text : input,
            csrfmiddlewaretoken: '{{ csrf_token }}'
        },
        success: function (data,) {
            console.log("GETTING CHATBOT RESPONSE")
            console.log(data)
            chatbot_response = data;
            //Create chatbot text paragraph
            chatbot_reply = document.createElement("p");
            chatbot_reply.appendChild(document.createTextNode(data));
            chatbot_reply.setAttribute("class", "chatbot_chat_text chatbot_text");
            chatbot_reply.setAttribute("id", "chatbot" + chat);
            chatbot_reply.setAttribute("onclick", "show_translation(this)");
            chatbot_reply.setAttribute("translated", "false"); 

            //Create chatbot text bubble
            var chatbot_text_bubble = document.createElement("li");
            chatbot_text_bubble.setAttribute("id", "botchat"+chat);

            //Append the chatbot text to the chatbot text bubble
            chatbot_text_bubble.appendChild(chatbot_reply);

            //Append the chatbot text bubble to the chat list
            var ul = document.getElementById("chat");
            ul.appendChild(chatbot_text_bubble);
            document.getElementById(chatbot_text_bubble.getAttribute('id')).scrollIntoView(); 
            console.log(ul);
        }
    });

    //PRINTS ENTITIES FROM CHATBOT TO ENTITIES LIST
    try {
        $.ajax({
            type: "POST",
            url:"/ajax/get_entities/",
            dataType: "json",
            data: {
                user_input : chatbot_response,
                csrfmiddlewaretoken: '{{ csrf_token }}'
             },
            success: function (data,) {
                console.log('get_entities = SUCCESS!');

                //Populate the entity list
                var count = 1;
                data.forEach(function(entity) {

                    //Create entity link
                    var a = document.createElement("a");
                    var name =  entity.name; 
                    a.appendChild(document.createTextNode(name));
                    a.setAttribute("target", "_blank");

                    try{ 
                        a.setAttribute("href", entity.metadata.wikipedia_url);

                        //Create entity listing
                        var li = document.createElement("li");
                        li.appendChild(a)
                        li.setAttribute("id", "li"+count);

                        //Append entity listing to entity list
                        var ul = document.getElementById("entity_list");
                        ul.appendChild(li);
                        count++;
                    }
                    catch(error) {
                        console.log('error handled')
                    }
                        
                    });

                    
                }
            });
    }
    catch(error){
        console.log("No entities detected.");
    }
}

//OUTPUT TRANSLATION TO CHAT CONSOLE
function show_translation(element) {
    console.log("SHOW TRANSLATION: ");
    console.log(element);

    var id = element.id;
    var x =  document.getElementById(id).textContent; 
    var y = $('#dialog_options option:selected').attr('value');
    var z = $('#translation_options option:selected').attr('value');

    var t;
    $.ajax({
        type: "POST",
        url:"/ajax/get_translation/",
        dataType: "json",
        data: {
            user_input : x,
            chat_lang : y,
            translate_lang : z,
            csrfmiddlewaretoken: '{{ csrf_token }}'
        },
        success: function (data,) {
            console.log('get_translation = SUCCESS!');
            console.log(data);
            //check if translated attribute in parent is false or true
            var parent =  document.getElementById(id);
            var parentID = parent.getAttribute('id');
            if(parent.getAttribute('translated') == 'true') {
                var child = document.getElementById('translation' + parentID);
                parent.removeChild(child);
                parent.setAttribute('translated', 'false');
            }
            else {
                //Create translated text paragraph
                translationResult = data.translatedText;
                translationResult = translationResult.replace(/&#39;/g, "\'")
                translationResult = translationResult.replace(/&quot;/g, "\"")
                translated_text = document.createElement("p");
                translated_text.appendChild(document.createTextNode(translationResult));
                translated_text.setAttribute("class", "translated_text");
                translated_text.setAttribute("id", "translation"+parentID);

                //Append translated text bubble to user text bubble
                user_text_bubble = document.getElementById(id);
                user_text_bubble.appendChild(translated_text);
                parent.setAttribute('translated', 'true');
                
                console.log(user_text_bubble);
            }
            

        }
    });

    
} 

function speak_input(){
    //DISPLAY MIC ICON TO INDICATE SPEAKING

    //CALL SPEECH_TO_TEXT

    $.ajax({
        type: "POST",
        url:"/ajax/speak_input/",
        dataType: "json",
        data: {
            csrfmiddlewaretoken: '{{ csrf_token }}'
        },
        success: function (data,) {
            console.log('get_translation = SUCCESS!');
            console.log(data);

            //append the translated test to
            li = document.createElement("li");
            li.appendChild(document.createTextNode(data.translatedText));
            elem = document.getElementById(id);
            elem.appendChild(li);
            console.log(elem);


        }
    });

}
