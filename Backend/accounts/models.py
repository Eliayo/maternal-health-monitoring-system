from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta


class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('provider', 'Healthcare Provider'),
        ('mother', 'Patient'),
    )

    DESIGNATION_CHOICES = (
        ('doctor', 'Doctor'),
        ('nurse', 'Nurse'),
    )

    email = models.EmailField(unique=True, blank=True, null=True)
    role = models.CharField(
        max_length=20, choices=ROLE_CHOICES, default='mother')
    designation = models.CharField(
        max_length=20,
        choices=DESIGNATION_CHOICES,
        blank=True,
        null=True,
        help_text="Only applies if role is 'provider'"
    )
    must_change_password = models.BooleanField(default=True)

    username = models.CharField(
        max_length=150, unique=True, blank=True, null=True)
    department = models.CharField(max_length=100, blank=True, null=True)
    phone_number = models.CharField(
        max_length=20, unique=True, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    sex = models.CharField(
        max_length=10,
        choices=(('male', 'Male'), ('female', 'Female')),
        blank=True,
        null=True
    )
    custom_id = models.CharField(
        max_length=20, unique=True, blank=True, null=True)

    # ✅ Maternal biodata (for mothers only)
    religion = models.CharField(max_length=50, blank=True, null=True)
    ethnic_group = models.CharField(max_length=50, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    marital_status = models.CharField(
        max_length=20,
        choices=[('single', 'Single'), ('married', 'Married'),
                 ('divorced', 'Divorced')],
        blank=True,
        null=True
    )
    education_level = models.CharField(
        max_length=20,
        choices=[('primary', 'Primary'), ('secondary', 'Secondary'),
                 ('tertiary', 'Tertiary'), ('other', 'Other')],
        blank=True,
        null=True
    )
    occupation = models.CharField(max_length=100, blank=True, null=True)

    # ✅ Next of kin (for mothers only)
    nok_name = models.CharField(max_length=100, blank=True, null=True)
    nok_relationship = models.CharField(max_length=50, blank=True, null=True)
    nok_address = models.TextField(blank=True, null=True)
    nok_phone = models.CharField(max_length=20, blank=True, null=True)
    nok_occupation = models.CharField(max_length=100, blank=True, null=True)
    nok_education_level = models.CharField(
        max_length=20,
        choices=[('primary', 'Primary'), ('secondary', 'Secondary'),
                 ('tertiary', 'Tertiary'), ('other', 'Other')],
        blank=True,
        null=True
    )

    created_by = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='mothers_created'
    )

    def __str__(self):
        return f"{self.username} ({self.role})"


class Appointment(models.Model):
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='appointments_as_patient'
    )
    provider = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='appointments_as_provider'
    )
    appointment_type = models.CharField(max_length=100)
    appointment_date = models.DateTimeField()
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('completed', 'Completed'),
            ('missed', 'Missed'),
            ('cancelled', 'Cancelled'),
        ],
        default='pending'
    )

    def __str__(self):
        return f"{self.patient} - {self.appointment_type} on {self.appointment_date.strftime('%Y-%m-%d %H:%M')}"


class ActivityLog(models.Model):
    ACTION_CHOICES = [
        ('create', 'Create'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        ('login', 'Login'),
        ('other', 'Other'),
    ]

    actor = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='activity_logs')
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    target = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.actor.username} {self.action} {self.target} @ {self.timestamp.strftime('%Y-%m-%d %H:%M')}"


class SystemSettings(models.Model):
    reminder_time_in_hours = models.PositiveIntegerField(default=24)
    allow_mother_reschedule = models.BooleanField(default=True)
    timezone = models.CharField(max_length=100, default="UTC")
    notify_email = models.BooleanField(default=True)
    notify_sms = models.BooleanField(default=False)

    def __str__(self):
        return "System Settings"

    class Meta:
        verbose_name_plural = "System Settings"


# ========== Health Records =========

class PatientHealthRecord(models.Model):
    mother = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="health_record",
        limit_choices_to={"role": "mother", "is_active": True},
    )
    recorded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name="created_health_records",
        limit_choices_to={"role": "provider"}
    )
    blood_group = models.CharField(max_length=3, blank=True)
    genotype = models.CharField(max_length=4, blank=True)
    height_cm = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True)
    allergies = models.TextField(blank=True)
    chronic_conditions = models.TextField(blank=True)  # simple comma/line list
    gravidity = models.PositiveSmallIntegerField(null=True, blank=True)
    parity = models.PositiveSmallIntegerField(null=True, blank=True)
    lmp = models.DateField(null=True, blank=True)  # last menstrual period
    edd = models.DateField(null=True, blank=True)  # estimated due date
    medications = models.TextField(blank=True)
    recent_family_planning_method = models.CharField(
        max_length=100, blank=True)
    previous_illness = models.TextField(blank=True)
    previous_surgery = models.TextField(blank=True)
    family_history = models.TextField(blank=True)

    INFERTILITY_CHOICES = [
        ("none", "None"),
        ("treated", "Treated"),
        ("untreated", "Untreated"),
    ]
    infertility_status = models.CharField(
        max_length=10, choices=INFERTILITY_CHOICES, blank=True)

    # Investigations
    blood_group_father = models.CharField(max_length=3, blank=True)
    rhesus_factor_mother = models.CharField(max_length=5, blank=True)
    rhesus_factor_father = models.CharField(max_length=5, blank=True)
    hepatitis_b_status = models.CharField(max_length=20, blank=True)
    vdrl_status = models.CharField(max_length=20, blank=True)
    rv_status = models.CharField(max_length=20, blank=True)

    # Hemoglobin
    haemoglobin_booking = models.DecimalField(
        max_digits=4, decimal_places=1, null=True, blank=True)
    haemoglobin_28w = models.DecimalField(
        max_digits=4, decimal_places=1, null=True, blank=True)
    haemoglobin_36w = models.DecimalField(
        max_digits=4, decimal_places=1, null=True, blank=True)

    # Ultrasounds & PAP smear
    ultrasound1_date = models.DateField(null=True, blank=True)
    ultrasound1_result = models.TextField(blank=True)
    ultrasound2_date = models.DateField(null=True, blank=True)
    ultrasound2_result = models.TextField(blank=True)
    pap_smear_date = models.DateField(null=True, blank=True)
    pap_smear_comments = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # auto-calc EDD (40 weeks) if LMP given and EDD not set
        if self.lmp and not self.edd:
            self.edd = self.lmp + timedelta(days=280)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"HealthRecord({getattr(self.mother, 'custom_id', self.mother_id)})"


class PreviousPregnancy(models.Model):
    health_record = models.ForeignKey(
        PatientHealthRecord, on_delete=models.CASCADE, related_name="previous_pregnancies")
    place_of_birth = models.CharField(max_length=100, blank=True)
    gestation_at_delivery = models.CharField(max_length=50, blank=True)
    mode_of_delivery = models.CharField(max_length=50, blank=True)
    labour_duration = models.CharField(max_length=50, blank=True)
    outcome = models.CharField(max_length=100, blank=True)
    birth_weight = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True)
    complications = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)


class ExaminationRecord(models.Model):
    mother = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="examinations",
        limit_choices_to={"role": "mother", "is_active": True},
    )
    provider = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="recorded_examinations",
        limit_choices_to={"role": "provider"},
    )

    visit_date = models.DateTimeField(default=timezone.now)
    gestational_age_weeks = models.DecimalField(
        max_digits=4, decimal_places=1, null=True, blank=True)

    # Vitals
    blood_pressure_systolic = models.PositiveSmallIntegerField(
        null=True, blank=True)
    blood_pressure_diastolic = models.PositiveSmallIntegerField(
        null=True, blank=True)
    weight_kg = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True)
    temperature_c = models.DecimalField(
        max_digits=4, decimal_places=1, null=True, blank=True)
    pulse_rate = models.PositiveSmallIntegerField(null=True, blank=True)
    respiratory_rate = models.PositiveSmallIntegerField(null=True, blank=True)

    # Obstetric exam
    fundal_height_cm = models.DecimalField(
        max_digits=4, decimal_places=1, null=True, blank=True)
    fetal_heart_rate = models.PositiveSmallIntegerField(null=True, blank=True)

    # Urinalysis (simple string choices)
    urine_protein = models.CharField(
        max_length=10, blank=True)   # e.g. -, +, ++
    urine_glucose = models.CharField(
        max_length=10, blank=True)   # e.g. -, +, ++

    notes = models.TextField(blank=True)
    next_appointment = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ("pending", "Pending"),
            ("completed", "Completed"),
            ('missed', 'Missed'),
            ("cancelled", "Cancelled"),
        ],
        default="pending",
    )
    # or choices: None/Mild/Severe
    oedema = models.CharField(max_length=20, blank=True)
    presentation = models.CharField(max_length=50, blank=True)
    lie = models.CharField(max_length=50, blank=True)
    problem_list = models.TextField(blank=True)
    delivery_plan = models.TextField(blank=True)
    admission_instructions = models.TextField(blank=True)

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-visit_date", "-id")

    def assess_risk(self):
        """
        Simple maternal risk assessment based on vitals & exam findings.
        """
        # Default risk
        risk = "Normal"

        # Blood pressure (hypertension)
        if self.blood_pressure_systolic and self.blood_pressure_diastolic:
            if self.blood_pressure_systolic >= 140 or self.blood_pressure_diastolic >= 90:
                risk = "High"

        # Oedema
        if self.oedema and self.oedema.lower() in ["moderate", "severe"]:
            risk = "High"

        # Proteinuria (sign of preeclampsia)
        if self.urine_protein and self.urine_protein in ["++", "+++"]:
            risk = "High"

        return risk

    def __str__(self):
        return f"Visit#{self.id} for {getattr(self.mother, 'custom_id', self.mother_id)}"


class Notification(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField(max_length=120)
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)

    # Optional deep link
    object_type = models.CharField(max_length=50, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return f"Notif to {self.user_id}: {self.title}"


class AppointmentReminder(models.Model):
    KIND_CHOICES = (("day_before", "Day Before"), ("same_day", "Same Day"))
    exam = models.ForeignKey(
        ExaminationRecord, on_delete=models.CASCADE, related_name="reminders")
    kind = models.CharField(max_length=20, choices=KIND_CHOICES)
    sent_at = models.DateTimeField(auto_now_add=True)
    # created_by = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        unique_together = ("exam", "kind")
