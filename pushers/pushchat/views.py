from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
#render library for returning views to the browser
from django.shortcuts import render
#decorator to make a function only accessible to registered users
from django.contrib.auth.decorators import login_required
#import the user library
from pusher import Pusher
from django.http import JsonResponse, HttpResponse
from google.protobuf.json_format import MessageToJson


#replace the xxx with your app_id, key and secret respectively
#instantate the pusher class
pusher = Pusher(app_id=u'894968', key=u'61ac9db7f0d63277363f', secret=u'c6391199884d3dba69f2')
# Create your views here.
#login required to access this page. will redirect to admin login page.
@login_required(login_url='/admin/login/')
def chat(request):
    return render(request,"chat.html");

@csrf_exempt
def broadcast(request):
    pusher.trigger(u'a_channel', u'an_event', {u'name': request.user.username, u'message': request.POST['message']})
    return HttpResponse("done");

#GOOGLE LIBRARIES
import os
# Imports the Google Cloud client library
from google.cloud import translate_v2 as translate
from google.cloud import language
from google.cloud.language import enums
from google.protobuf.json_format import MessageToJson, MessageToDict

#GOOGLE AUTH
credential_path = "./GoogleAuth/GoogleCloudKey_MyServiceAccount.json"
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = credential_path

# Instantiates a client
# to translate to another language instead of default English: translate_client = translate.Client(target_language='es')
translate_client = translate.Client()
#SET UP LANGUAGE CLIENT 
language_client = language.LanguageServiceClient()

#GET LANGUAGES
import json
def get_languages(request):
    results = translate_client.get_languages()
    json_r = json.dumps(results)
    # for language in results:
        # print(u'{name} ({language})'.format(**language))
    # print(type(json_r))
    # render(request, 'pushers/pushchat/templates/chat.html',)    
    return JsonResponse(json_r, safe=False)

#GET ENTITY ANALYSIS
def get_entities(request):
    #GET USER INPUT
    text = request.POST.get('user_input')

    #CREATE DOCUMENT
    # print("Text: ",format(text))
    document = language.types.Document(
        content =  text, 
        type =  'PLAIN_TEXT',
        )
    print(document)
    
    #ENTITY ANALYSIS
    response = language_client.analyze_entities(
        document = document, 
        encoding_type='UTF32',
        )
    # print("ent_analysis: \n")
    # print(response.entities)
    
    # print("ENTITIES: \n")
    # print(ent_analysis.getEntities())
    # for entity in response.entities:
    #     print('=' * 20)
    #     print('         name: {0}'.format(entity.name))
    #     print('         type: {0}'.format(entity.type))
    #     print('     metadata: {0}'.format(entity.metadata))
    #     print('     salience: {0}'.format(entity.salience))
    
    # serialized = MessageToJson(response.entities)
    response = MessageToDict(response, preserving_proto_field_name = True)
    desired_res = response["entities"]
    print("DESIRED_RES: \n")
    print(desired_res)
    return JsonResponse(desired_res, safe=False)

def get_translation(request):
    #GET USER INPUT
    text = request.POST.get('user_input')
    chatIn = request.POST.get('chat_lang')
    translateTo = request.POST.get('translate_lang')
    print(text, " ", chatIn, " ", translateTo)
    response = translate_client.translate(text, target_language = translateTo, source_language = chatIn)
    print(response)
    return JsonResponse(response, safe=False)