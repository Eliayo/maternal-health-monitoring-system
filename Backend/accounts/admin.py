from django.contrib import admin
from .models import SystemSettings, PatientHealthRecord, ExaminationRecord

admin.site.register(SystemSettings)


# Register your models here.
@admin.register(PatientHealthRecord)
class PatientHealthRecordAdmin(admin.ModelAdmin):
    list_display = ("mother", "blood_group", "genotype",
                    "edd", "updated_at", "is_active")
    search_fields = ("mother__custom_id",
                     "mother__first_name", "mother__last_name")


@admin.register(ExaminationRecord)
class ExaminationRecordAdmin(admin.ModelAdmin):
    list_display = ("mother", "provider", "visit_date",
                    "bp", "weight_kg", "is_active")
    search_fields = ("mother__custom_id", "provider__username")

    def bp(self, obj):
        if obj.blood_pressure_systolic and obj.blood_pressure_diastolic:
            return f"{obj.blood_pressure_systolic}/{obj.blood_pressure_diastolic}"
        return "-"
