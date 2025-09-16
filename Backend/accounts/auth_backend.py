# accounts/auth_backend.py

from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django.db.models import Q

User = get_user_model()


class CustomLoginBackend(ModelBackend):
    """
    Custom authentication backend to allow login using:
    - username (for everyone)
    - custom_id (e.g., MOM-0001, DOC-0001, ADM-0001) for everyone
    - phone_number (only for mothers)
    """

    def authenticate(self, request, username=None, password=None, **kwargs):
        user = None

        try:
            # Build query for username or custom_id
            query = Q(username=username) | Q(custom_id=username)

            # Add phone number lookup if user is a mother (determined after fetching)
            potential_users = User.objects.filter(
                query | Q(phone_number=username))

            # There might be multiple matches (e.g., one with matching phone, one with username)
            for potential_user in potential_users:
                if potential_user.check_password(password):
                    # If login is by phone number, ensure only mothers are allowed
                    if username == potential_user.phone_number and potential_user.role != 'mother':
                        continue  # skip non-mothers logging in with phone
                    return potential_user
        except User.DoesNotExist:
            return None

        return None
