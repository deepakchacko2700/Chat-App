from django.views.generic import TemplateView
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render


# catchall = TemplateView.as_view(template_name='index.html')
@csrf_exempt
def catchall(request):
    return render(request, 'index.html')