import datetime
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, Appointment, ActivityLog, SystemSettings, PatientHealthRecord, ExaminationRecord, PreviousPregnancy, Notification, AppointmentReminder
from django.db import IntegrityError
import uuid
from drf_spectacular.utils import extend_schema_field
from django.utils.timezone import make_aware
from datetime import datetime, time

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'custom_id', 'username', 'role', 'first_name',
                  'last_name', 'email', 'phone_number', 'department',
                  'must_change_password', 'created_by_name']
        read_only_fields = ['id', 'custom_id',
                            'username', 'role', 'must_change_password']

    def get_created_by_name(self, obj):
        return f"{obj.created_by.first_name} {obj.created_by.last_name}" if obj.created_by else None


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['username'] = user.username
        token['custom_id'] = getattr(user, 'custom_id', None)
        token['role'] = 'admin' if user.is_superuser else getattr(
            user, 'role', 'user')

        return token

    def validate(self, attrs):
        login_input = attrs.get('username')
        password = attrs.get('password')

        user = None

        try:
            # First try: username
            user = User.objects.filter(username__iexact=login_input).first()

            # Second try: custom_id
            if not user:
                user = User.objects.filter(
                    custom_id__iexact=login_input).first()

            # Third try: phone number (only for mothers)
            if not user and login_input.isdigit():
                user = User.objects.filter(
                    phone_number=login_input, role='mother').first()

            if not user:
                raise serializers.ValidationError(
                    {"detail": "Invalid login credentials."})

            # Restrict providers/admins from logging in using phone number
            if login_input.isdigit() and user.role in ['admin', 'provider']:
                raise serializers.ValidationError({
                    "detail": "Providers/Admins must log in with custom ID or username."
                })

            if not user.check_password(password):
                raise serializers.ValidationError(
                    {"detail": "Invalid login credentials."})

            self.user = user  # needed for TokenObtainPairSerializer.validate()

        except Exception:
            raise serializers.ValidationError(
                {"detail": "Invalid login credentials."})

        # Call parent validate to generate token
        data = super().validate(attrs)

        # Custom fields in the response
        data['username'] = self.user.username
        data['custom_id'] = getattr(self.user, 'custom_id', None)
        data['role'] = 'admin' if self.user.is_superuser else self.user.role or 'user'
        data['must_change_password'] = self.user.must_change_password

        return data


class AdminCreateUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    password2 = serializers.CharField(write_only=True, required=False)
    designation = serializers.ChoiceField(
        choices=User.DESIGNATION_CHOICES,
        required=False
    )

    class Meta:
        model = User
        fields = [
            'username',
            'password',
            'password2',
            'role',
            'first_name',
            'last_name',
            'email',
            'department',
            'phone_number',
            'address',
            'sex',
            'designation',
        ]

    def validate(self, data):
        password = data.get('password')
        password2 = data.get('password2')
        role = data.get('role')
        designation = data.get('designation')

        if password or password2:
            if password != password2:
                raise serializers.ValidationError("Passwords do not match.")

        if role == 'provider' and not designation:
            raise serializers.ValidationError({
                "designation": "Designation (doctor/nurse) is required for providers."
            })
        if role != 'provider' and designation:
            raise serializers.ValidationError({
                "designation": "Only providers can have a designation."
            })

        return data

    def validate_role(self, value):
        if value not in ['mother', 'provider']:
            raise serializers.ValidationError(
                "Admins can only create mothers or providers.")
        return value

    def generate_custom_id(self, role):
        from django.contrib.auth import get_user_model
        User = get_user_model()

        prefix = {
            'mother': 'MOM-',
            'provider': 'DOC-',  # or NUR-
            'admin': 'ADM-',
        }.get(role, 'USR-')

        existing_ids = User.objects.filter(
            custom_id__startswith=prefix
        ).values_list('custom_id', flat=True)

        max_num = 0
        for cid in existing_ids:
            try:
                num = int(cid.replace(prefix, ''))
                if num > max_num:
                    max_num = num
            except:
                continue

        return f"{prefix}{str(max_num + 1).zfill(4)}"

    def create(self, validated_data):
        from django.contrib.auth import get_user_model
        User = get_user_model()

        request = self.context.get('request')
        password = validated_data.pop('password', None)
        validated_data.pop('password2', None)

        # Auto-generate username
        if not validated_data.get('username'):
            base_username = (
                validated_data['first_name'][0] +
                validated_data['last_name']
            ).lower()
            for _ in range(5):
                random_suffix = str(uuid.uuid4())[:5]
                generated_username = base_username + random_suffix
                if not User.objects.filter(username=generated_username).exists():
                    validated_data['username'] = generated_username
                    break
            else:
                raise serializers.ValidationError({
                    "username": "Could not generate a unique username. Please try again."
                })

        # Default password if not provided
        if not password:
            password = (
                validated_data['first_name'][:3] +
                validated_data['last_name'][:3] +
                '123'
            ).lower()

        try:
            user = User(**validated_data)

            # Set custom_id
            user.custom_id = self.generate_custom_id(user.role)

            # Track creator only if a provider is creating
            if request and request.user.role == 'provider':
                user.created_by = request.user

            user.set_password(password)
            user.save()
            return user

        except IntegrityError as e:
            if "email" in str(e).lower():
                raise serializers.ValidationError(
                    {"email": "A user with this email already exists."})
            elif "username" in str(e).lower():
                raise serializers.ValidationError(
                    {"username": "Generated username already exists. Try again."})
            else:
                raise serializers.ValidationError(
                    "An unexpected error occurred while creating the user.")


class AdminUpdateUserSerializer(serializers.ModelSerializer):
    designation = serializers.ChoiceField(  # ✅ NEW
        choices=User.DESIGNATION_CHOICES,
        required=False
    )

    class Meta:
        model = User
        fields = [
            'first_name',
            'last_name',
            'email',
            'phone_number',
            'department',
            'address',
            'sex',
            'role',
            'designation',  # ✅ NEW
        ]

    def validate(self, data):
        role = data.get('role')
        designation = data.get('designation')

        if role == 'provider' and not designation:
            raise serializers.ValidationError(
                {"designation": "Designation (doctor/nurse) is required for providers."}
            )
        if role != 'provider' and designation:
            raise serializers.ValidationError(
                {"designation": "Only providers can have a designation."}
            )
        return data

    def validate_role(self, value):
        if value not in ['mother', 'provider']:
            raise serializers.ValidationError("Invalid role.")
        return value


class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    provider_name = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = [
            'id',
            'appointment_type',
            'appointment_date',
            'notes',
            'created_at',
            'patient_name',
            'provider_name',
            'status',
        ]

    @extend_schema_field(serializers.CharField())
    def get_patient_name(self, obj):
        if obj.patient:
            return f"{obj.patient.first_name} {obj.patient.last_name}"
        return None

    @extend_schema_field(serializers.CharField())
    def get_provider_name(self, obj):
        if obj.provider:
            return f"{obj.provider.first_name} {obj.provider.last_name}"
        return None


class AppointmentCreateSerializer(serializers.ModelSerializer):
    patient = serializers.SlugRelatedField(
        slug_field='username',
        queryset=User.objects.all()
    )
    provider = serializers.SlugRelatedField(
        slug_field='username',
        queryset=User.objects.all(),
        required=False,
        allow_null=True
    )

    class Meta:
        model = Appointment
        fields = [
            'patient',
            'provider',
            'appointment_type',
            'appointment_date',
            'notes',
        ]


class ActivityLogSerializer(serializers.ModelSerializer):
    actor_name = serializers.SerializerMethodField()

    class Meta:
        model = ActivityLog
        fields = ['id', 'actor', 'actor_name',
                  'action', 'description', 'timestamp']

    def get_actor_name(self, obj):
        return f"{obj.actor.first_name} {obj.actor.last_name}" if obj.actor else None


class AdminProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email',
                  'phone_number', 'sex', 'department', 'address']


class SystemSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSettings
        fields = ['reminder_time_in_hours', 'allow_mother_reschedule',
                  'timezone', 'notify_email', 'notify_sms']


class ProviderAddMotherSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "first_name",
            "last_name",
            "username",
            "phone_number",
            "address",
            "religion",
            "ethnic_group",
            "date_of_birth",
            "marital_status",
            "education_level",
            "occupation",
            # Next of kin fields
            "nok_name",
            "nok_relationship",
            "nok_address",
            "nok_phone",
            "nok_occupation",
            "nok_education_level",
        ]

    def generate_custom_id(self):
        prefix = 'MOM-'
        existing_ids = User.objects.filter(
            custom_id__startswith=prefix
        ).values_list('custom_id', flat=True)

        max_num = 0
        for cid in existing_ids:
            try:
                num = int(cid.replace(prefix, ''))
                if num > max_num:
                    max_num = num
            except:
                continue

        return f"{prefix}{str(max_num + 1).zfill(4)}"

    def create(self, validated_data):
        from uuid import uuid4

        validated_data["role"] = "mother"
        validated_data["sex"] = "female"
        validated_data["must_change_password"] = True

        request = self.context.get("request")
        if request and hasattr(request, "user"):
            validated_data["created_by"] = request.user

        # Generate default password
        password = (
            validated_data["first_name"][:3] +
            validated_data["last_name"][:3] +
            "123"
        ).lower()

        # Auto-generate username if not provided
        if not validated_data.get("username"):
            base_username = (
                validated_data["first_name"][0] +
                validated_data["last_name"]
            ).lower()
            for _ in range(5):
                suffix = str(uuid4())[:5]
                generated_username = base_username + suffix
                if not User.objects.filter(username=generated_username).exists():
                    validated_data["username"] = generated_username
                    break
            else:
                raise serializers.ValidationError({
                    "username": "Could not generate a unique username. Try again."
                })

        try:
            user = User(**validated_data)
            user.custom_id = self.generate_custom_id()
            user.set_password(password)
            user.save()
            return user
        except IntegrityError as e:
            if "username" in str(e).lower():
                raise serializers.ValidationError({
                    "username": "Username already exists."
                })
            elif "phone" in str(e).lower():
                raise serializers.ValidationError({
                    "phone_number": "Phone number already exists."
                })
            else:
                raise serializers.ValidationError(
                    "An unexpected error occurred while creating the user.")


class ProviderUpdateMotherSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "first_name",
            "last_name",
            "phone_number",
            "address",
            "religion",
            "ethnic_group",
            "date_of_birth",
            "marital_status",
            "education_level",
            "occupation",
            # Next of kin fields
            "nok_name",
            "nok_relationship",
            "nok_address",
            "nok_phone",
            "nok_occupation",
            "nok_education_level",
        ]

    def validate(self, attrs):
        restricted_fields = [
            'date_of_birth', 'ethnic_group', 'religion',
            'marital_status', 'education_level'
        ]
        attempted = [f for f in restricted_fields if f in attrs]
        if attempted:
            raise serializers.ValidationError({
                field: "You are not allowed to update this field." for field in attempted
            })
        return attrs


class MotherListSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['custom_id', 'full_name', 'phone_number', 'date_joined']

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"


class ProviderMotherDetailSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "custom_id",
            "username",
            "full_name",
            "first_name",
            "last_name",
            "phone_number",
            "address",
            "religion",
            "ethnic_group",
            "date_of_birth",
            "marital_status",
            "education_level",
            "occupation",
            "nok_name",
            "nok_relationship",
            "nok_address",
            "nok_phone",
            "nok_occupation",
            "nok_education_level",
            # add all other mother-related fields you want to display
        ]

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()


# ========== Serializers for Health Records =========

class PatientMiniSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "custom_id", "first_name", "last_name",
                  "full_name", "phone_number", "email")

    def get_full_name(self, obj):
        fn = (obj.first_name or "").strip()
        ln = (obj.last_name or "").strip()
        return f"{fn} {ln}".strip() or getattr(obj, "full_name", "")


# --- PreviousPregnancy ---
class PreviousPregnancySerializer(serializers.ModelSerializer):
    class Meta:
        model = PreviousPregnancy
        fields = (
            "id",
            "place_of_birth",
            "gestation_at_delivery",
            "mode_of_delivery",
            "labour_duration",
            "outcome",
            "birth_weight",
            "complications",
            "is_active",
        )
        read_only_fields = ("id", "is_active")
        extra_kwargs = {
            "health_record": {"write_only": True, "required": False},
        }

    # ✅ Validation: birth_weight must be > 0
    def validate_birth_weight(self, value):
        if value is not None and value <= 0:
            raise serializers.ValidationError(
                "Birth weight must be greater than zero.")
        return value


# --- ExaminationRecord ---
class ExaminationRecordSerializer(serializers.ModelSerializer):
    mother_info = PatientMiniSerializer(source="mother", read_only=True)
    provider_name = serializers.SerializerMethodField()
    risk_status = serializers.SerializerMethodField()

    class Meta:
        model = ExaminationRecord
        fields = (
            "id",
            "visit_date",
            "gestational_age_weeks",
            "blood_pressure_systolic",
            "blood_pressure_diastolic",
            "weight_kg",
            "temperature_c",
            "pulse_rate",
            "respiratory_rate",
            "fundal_height_cm",
            "fetal_heart_rate",
            "urine_protein",
            "urine_glucose",
            "notes",
            "next_appointment",
            "oedema",
            "presentation",
            "lie",
            "problem_list",
            "delivery_plan",
            "admission_instructions",
            "mother_info",   # ✅ only expose read-only version
            "provider_name",
            "risk_status",
            "status",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id", "mother_info", "provider",
            "provider_name", "risk_status",
            "created_at", "updated_at"
        )
        extra_kwargs = {"mother": {"write_only": True, "required": False}}

    def get_provider_name(self, obj):
        if obj.provider:
            fn = (obj.provider.first_name or "").strip()
            ln = (obj.provider.last_name or "").strip()
            return (f"{fn} {ln}".strip() or
                    getattr(obj.provider, "full_name", "") or
                    obj.provider.username)
        return None

    def get_risk_status(self, obj):
        # Ensure the model actually has this method
        if hasattr(obj, "assess_risk"):
            return obj.assess_risk()
        return None

    def validate(self, data):
        systolic = data.get("blood_pressure_systolic")
        diastolic = data.get("blood_pressure_diastolic")
        weight = data.get("weight_kg")

        if systolic and diastolic and diastolic >= systolic:
            raise serializers.ValidationError(
                {"blood_pressure_diastolic": "Diastolic must be less than systolic."}
            )

        if weight is not None and weight <= 0:
            raise serializers.ValidationError(
                {"weight_kg": "Weight must be greater than zero."}
            )

        return data


# --- PatientHealthRecord ---


class PatientHealthRecordSerializer(serializers.ModelSerializer):
    mother_info = PatientMiniSerializer(source="mother", read_only=True)
    previous_pregnancies = PreviousPregnancySerializer(
        many=True, read_only=True
    )
    examinations = ExaminationRecordSerializer(
        many=True, read_only=True, source="mother.examinations"
    )

    class Meta:
        model = PatientHealthRecord
        fields = (
            "id",
            "mother",          # write-only
            "mother_info",     # read-only
            "recorded_by",
            "blood_group",
            "genotype",
            "height_cm",
            "allergies",
            "chronic_conditions",
            "gravidity",
            "parity",
            "lmp",
            "edd",
            "medications",
            "recent_family_planning_method",
            "previous_illness",
            "previous_surgery",
            "family_history",
            "infertility_status",
            "blood_group_father",
            "rhesus_factor_mother",
            "rhesus_factor_father",
            "hepatitis_b_status",
            "vdrl_status",
            "rv_status",
            "haemoglobin_booking",
            "haemoglobin_28w",
            "haemoglobin_36w",
            "ultrasound1_date",
            "ultrasound1_result",
            "ultrasound2_date",
            "ultrasound2_result",
            "pap_smear_date",
            "pap_smear_comments",
            "previous_pregnancies",
            "examinations",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id", "mother_info", "edd",
            "created_at", "updated_at", "previous_pregnancies", "examinations"
        )
        extra_kwargs = {
            "mother": {"write_only": True, "required": False},
            "recorded_by": {"read_only": True},
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # ✅ Make all optional by default
        for field in self.fields.values():
            field.required = False

        # ✅ Explicitly required fields at booking
        required_fields = [
            "blood_group",
            "genotype",
            "height_cm",
            "gravidity",
            "parity",
            "lmp",
            "haemoglobin_booking",
        ]
        for f in required_fields:
            if f in self.fields:
                self.fields[f].required = True

    # ✅ Custom validation

    def validate(self, attrs):
        gravidity = attrs.get("gravidity")
        parity = attrs.get("parity")
        height = attrs.get("height_cm")

        if gravidity is not None and parity is not None and parity > gravidity:
            raise serializers.ValidationError(
                {"parity": "Parity cannot exceed gravidity."}
            )

        if height is not None and height <= 0:
            raise serializers.ValidationError(
                {"height_cm": "Height must be greater than zero."}
            )

        return attrs


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ("id", "title", "body", "created_at",
                  "read", "object_type", "object_id")
        read_only_fields = fields


# serializers.py
class AppointmentReminderSerializer(serializers.ModelSerializer):
    mother_id = serializers.CharField(
        source="exam.mother.custom_id", read_only=True)
    appointment_date = serializers.DateField(
        source="exam.next_appointment", read_only=True)
    mother_name = serializers.SerializerMethodField()

    class Meta:
        model = AppointmentReminder
        fields = ["id", "mother_id", "mother_name",
                  "appointment_date", "kind", "sent_at", "created_by"]
        read_only_fields = fields

    def get_mother_name(self, obj):
        mother = getattr(obj, "exam", None) and getattr(
            obj.exam, "mother", None)
        if not mother:
            return None
        fn = (mother.first_name or "").strip()
        ln = (mother.last_name or "").strip()
        return (f"{fn} {ln}".strip() or mother.username)


class MotherContactUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["phone_number", "address", "marital_status",
                  "education_level",
                  "occupation",
                  "nok_name",
                  "nok_relationship",
                  "nok_address",
                  "nok_phone",
                  "nok_occupation",
                  "nok_education_level"]


# # serializers.py


# class ChangePasswordSerializer(serializers.Serializer):
#     old_password = serializers.CharField(write_only=True, required=True)
#     new_password = serializers.CharField(write_only=True, required=True)

#     def validate_old_password(self, value):
#         # ensure request context is passed from the view
#         request = self.context.get("request")
#         user = getattr(request, "user", None)
#         if not user or not user.check_password(value):
#             raise serializers.ValidationError("Old password is incorrect.")
#         return value

#     def validate_new_password(self, value):
#         # uses Django validators (settings.AUTH_PASSWORD_VALIDATORS)
#         validate_password(value)
#         return value

  # inherits everything from admin version


class MotherProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "custom_id",
            "first_name",
            "last_name",
            "username",
            "email",
            "phone_number",
            "address",
            "religion",
            "ethnic_group",
            "date_of_birth",
            "marital_status",
            "education_level",
            "occupation",
            # Next of kin
            "nok_name",
            "nok_relationship",
            "nok_address",
            "nok_phone",
            "nok_occupation",
            "nok_education_level",
        ]
        read_only_fields = ["custom_id", "username", "email"]


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_new_password(self, value):
        validate_password(value)
        return value


class ProviderProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "custom_id",
            "first_name",
            "last_name",
            "username",
            "email",
            "phone_number",
            "address",
            "sex",
            "department",
            "designation",
        ]
        read_only_fields = ["custom_id", "username", "designation"]


class ProviderDashboardSerializer(serializers.Serializer):
    metrics = serializers.DictField()
    appointments_by_status = serializers.ListField()
    upcoming_appointments = serializers.ListField()
    recent_visits = serializers.ListField()
    recent_mothers = serializers.ListField()
    unread_notifications = serializers.IntegerField()


class UnifiedAppointmentSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    source = serializers.CharField()  # "admin" or "provider"
    patient_name = serializers.CharField()
    provider_name = serializers.CharField(allow_null=True)
    appointment_type = serializers.CharField()
    appointment_date = serializers.DateTimeField()
    status = serializers.CharField()
    notes = serializers.CharField(allow_blank=True, required=False)
    created_at = serializers.DateTimeField()

    @staticmethod
    def _get_full_name(user):
        if not user:
            return None
        full_name = f"{user.first_name} {user.last_name}".strip()
        return full_name if full_name else user.username

    @staticmethod
    def from_admin(appt: Appointment):
        return {
            "id": appt.id,
            "source": "admin",
            "patient_name": getattr(appt.patient, "get_full_name", lambda: appt.patient.username)(),
            "provider_name": getattr(appt.provider, "get_full_name", lambda: appt.provider.username)() if appt.provider else None,
            "appointment_type": appt.appointment_type,
            "appointment_date": appt.appointment_date,   # already datetime
            "status": appt.status,
            "notes": appt.notes,
            "created_at": appt.created_at,
        }

    @staticmethod
    def from_exam(exam: ExaminationRecord):
        appointment_dt = None
        if exam.next_appointment:
            # convert date → datetime with midnight time
            appointment_dt = make_aware(
                datetime.combine(exam.next_appointment, time.min)
            )

        return {
            "id": exam.id,
            "source": "provider",
            "patient_name": exam.mother.get_full_name() if hasattr(exam.mother, "get_full_name") else exam.mother.username,
            "provider_name": exam.provider.get_full_name() if exam.provider and hasattr(exam.provider, "get_full_name") else (exam.provider.username if exam.provider else None),
            "appointment_type": "Examination",
            "appointment_date": appointment_dt,  # normalized datetime
            "status": exam.status,
            "notes": exam.notes,
            "created_at": exam.created_at,
        }


class ProviderProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["full_name", "email", "phone", "address"
                  ]  # editable fields only
