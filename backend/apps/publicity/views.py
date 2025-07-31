from django.shortcuts import render, redirect
from .forms import PublicityForm as SubirDumentoImagenForm
from .models import Publicity as SubirDumentoImagen
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny 
from .models import Publicity
from .serializer import PublicitySerializer

class PublicityView(APIView): #requiero explicacion de que es esto -Juan

	def homepage(request):
		form = SubirDumentoImagenForm()
		return render(request, 'index.html', {'form': form})

	def upload(request):
		if request.method == "POST":
			form = SubirDumentoImagenForm(request.POST, request.FILES)
			if form.is_valid():
				form.save()
			return redirect("homepage")
		form = SubirDumentoImagenForm()
		movies = SubirDumentoImagen.objects.all()
		return render(request=request, template_name="index.html", context={'form': form, 'movies': movies})

	def delete(request, id):
		publicity = SubirDumentoImagen.objects.get(id_publicity=id)
		publicity.delete()
		return redirect("homepage")

class PublicityListView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [AllowAny] 
    
    def get(self, request):
        publicity = Publicity.objects.all()
        serializer = PublicitySerializer(publicity, many=True)

        return Response(serializer.data)
        
    def post(self, request):
        serializer = PublicitySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PublicityDetailView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    
    def get_object(self, pk):
        try:
            return Publicity.objects.get(pk=pk)
        except Publicity.DoesNotExist:
            return None
    
    def delete(self, request, pk):
        publicity = self.get_object(pk)
        if not publicity:
            return Response(status=status.HTTP_404_NOT_FOUND)
        publicity.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)