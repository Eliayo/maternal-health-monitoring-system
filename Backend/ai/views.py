# import requests
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import IsAuthenticated
# from rest_framework.response import Response
# from rest_framework import status
# from decouple import config

# HF_API_URL = "https://api-inference.huggingface.co/models/google/flan-t5-base"
# HEADERS = {
#     "Authorization": f"Bearer {config('HUGGINGFACE_API_KEY')}",
#     "Content-Type": "application/json"
# }


# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def chat_with_ai(request):
#     user_message = request.data.get('message')

#     if not user_message:
#         return Response({'error': 'No message provided'}, status=status.HTTP_400_BAD_REQUEST)

#     try:
#         payload = {
#             "inputs": f"Answer this like a helpful maternal health assistant: {user_message}"
#         }

#         response = requests.post(HF_API_URL, headers=HEADERS, json=payload)
#         response.raise_for_status()

#         data = response.json()
#         generated_text = data[0]["generated_text"]

#         return Response({'reply': generated_text})

#     except requests.exceptions.RequestException as e:
#         return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
