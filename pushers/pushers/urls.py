"""pushers URL Configuration
The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.10/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url
from django.contrib import admin
from django.contrib.auth import views as auth_views
from pushchat import views
from pushchat import views2
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    url(r'^$', views.chat),
    url(r'^admin/', admin.site.urls),
    url(r'^ajax/chat/$', views.broadcast),
    url(r'^ajax/get_languages/$', views.get_languages, name='get_languages'),
    url(r'^ajax/get_entities/$', views.get_entities, name='get_entities'),
    url(r'^ajax/get_translation/$', views.get_translation, name='get_translation'),
    # url(r'^ajax/speak_input/$', views2.speak_input, name='speak_input'),
]+ static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)