from django.urls import path
from .views import (
    CustomTokenObtainPairView,
    AdminOnlyView,
    ProviderOnlyView,
    MotherOnlyView,
    AdminCreateUserView,
    ChangePasswordView,
    UserListView,
    DeleteUserView,
    AdminUpdateUserView,
    CreateAppointmentView,
    RecentAppointmentsView,
    AppointmentListView,
    AppointmentStatusUpdateView,
    ActivityLogListView,
    AdminProfileView,
    SystemSettingsView,
    AdminProfileUpdateView,
    UpdatePasswordView,
    ProviderAddMotherView,
    ProviderUpdateMotherView,
    ProviderListMothersView,
    ProviderRetrieveMotherView,
    ProviderDeleteMotherView,
    ProviderMotherHealthView,
    ProviderExaminationListCreateView,
    ProviderExaminationDetailView,
    ProviderPreviousPregnancyListCreateView,
    ProviderPreviousPregnancyDetailView,
    MotherExaminationListView,
    MotherHealthRecordView,
    MotherPreviousPregnancyListView,
    ExportMotherHealthView,
    ProviderDashboardMetricsView,
    ProviderUpcomingAppointmentsView,
    ProviderRecentVisitsView,
    ProviderRecentPatientsView,
    ProviderReminderLogView,
    NotificationListView,
    MotherProfileView,
    MotherProfileUpdateView,
    MotherChangePasswordView,
    MotherAllAppointmentsView,
    MotherAppointmentsListView,
    MotherNextAppointmentView,
    #     MotherRequestRescheduleView,
    MotherNotificationListView,
    MotherNotificationMarkReadView,
    MotherEmergencyAlertView,
    MotherDashboardView,
    ProviderNotificationMarkReadView,
    ProviderNotificationMarkAllReadView,
    ProviderProfileView,
    ProviderProfileUpdateView,
    ProviderDashboardView,
    ProviderAppointmentsView,
    ProviderChangePasswordView,
    get_me,
    logout_view,
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('admin-only/', AdminOnlyView.as_view(), name='admin-only'),
    path('provider-only/', ProviderOnlyView.as_view(), name='provider-only'),
    path('mother-only/', MotherOnlyView.as_view(), name='mother-only'),

    # Admin User Management
    path('admin/create-user/', AdminCreateUserView.as_view(),
         name='admin-create-user'),
    path('admin/view-users/', UserListView.as_view(), name='admin-user-list'),
    path('admin/delete-user/<int:user_id>/',
         DeleteUserView.as_view(), name='admin-delete-user'),
    path('admin/update-user/<int:user_id>/',
         AdminUpdateUserView.as_view(), name='admin-update-user'),

    # Admin Appointments
    path('admin/create-appointment/', CreateAppointmentView.as_view(),
         name='admin-create-appointment'),
    path('admin/recent-appointments/', RecentAppointmentsView.as_view(),
         name='admin-recent-appointments'),
    path('admin/appointments-list/',
         AppointmentListView.as_view(), name='appointments-list'),
    path('admin/update-appointment-status/<int:appointment_id>/',
         AppointmentStatusUpdateView.as_view(), name='update-appointment-status'),

    # Admin Settings & Profile
    path('admin/activity-logs/', ActivityLogListView.as_view(),
         name='admin-activity-logs'),
    path('admin/profile/', AdminProfileView.as_view(), name='admin-profile'),
    path('admin/system-settings/',
         SystemSettingsView.as_view(), name='system-settings'),
    path("admin/profile-update/", AdminProfileUpdateView.as_view(),
         name="admin-profile-update"),

    # Password Management
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('mother/update-password/', UpdatePasswordView.as_view(),
         name='mother-update-password'),
    path('provider/update-password/', UpdatePasswordView.as_view(),
         name='provider-update-password'),
    path("provider/change-password/", ProviderChangePasswordView.as_view(),
         name="provider-change-password"),


    # Provider & Mother Management
    path('provider/add-mother/', ProviderAddMotherView.as_view(),
         name='provider-add-mother'),
    path('provider/update-mother/<str:custom_id>/',
         ProviderUpdateMotherView.as_view(), name='provider-update-mother'),
    path('provider/view-mothers/', ProviderListMothersView.as_view(),
         name='provider-list-mothers'),
    path('provider/retrieve-mother/<str:custom_id>/', ProviderRetrieveMotherView.as_view(),
         name='provider-retrieve-mother'),
    path("provider/delete-mother/<str:custom_id>/",
         ProviderDeleteMotherView.as_view(), name="delete-mother"),
    # urls.py
    path("provider/notifications/mark-read/<int:pk>/",
         ProviderNotificationMarkReadView.as_view(), name="provider-notif-read"),
    path("provider/notifications/mark-all-read/",
         ProviderNotificationMarkAllReadView.as_view(), name="provider-notif-read-all"),
    path("provider/profile/", ProviderProfileView.as_view(),
         name="provider-profile"),
    path("provider/profile/update/", ProviderProfileUpdateView.as_view(),
         name="provider-profile-update"),


    # Health record (one per mother)
    path("provider/mothers/<str:custom_id>/health/",
         ProviderMotherHealthView.as_view(), name="provider-mother-health"),

    # Examination records (many per mother)
    path("provider/mothers/<str:custom_id>/visits/",
         ProviderExaminationListCreateView.as_view(), name="provider-exam-list-create"),
    path("provider/mothers/<str:custom_id>/visits/<int:pk>/",
         ProviderExaminationDetailView.as_view(), name="provider-exam-detail"),

    # Previous Pregnancies
    path("provider/mothers/<str:custom_id>/pregnancies/",
         ProviderPreviousPregnancyListCreateView.as_view()),
    path("provider/mothers/<str:custom_id>/pregnancies/<int:pk>/",
         ProviderPreviousPregnancyDetailView.as_view()),

    # Mother Health Record (read-only)
    path("mother/health-record/", MotherHealthRecordView.as_view(),
         name="mother-health-record"),
    path("mother/examinations/", MotherExaminationListView.as_view(),
         name="mother-examinations"),
    path("mother/pregnancies/", MotherPreviousPregnancyListView.as_view(),
         name="mother-pregnancies"),

    # Export full health record (PDF/XLSX/CSV)
    path("provider/mothers/<str:custom_id>/export/", ExportMotherHealthView.as_view(),
         name="provider-mother-export"),

    path("provider/dashboard/metrics/", ProviderDashboardMetricsView.as_view(),
         name="provider-dashboard-metrics"),
    path("provider/dashboard/upcoming/", ProviderUpcomingAppointmentsView.as_view(),
         name="provider-dashboard-upcoming"),
    path("provider/dashboard/recent-visits/", ProviderRecentVisitsView.as_view(),
         name="provider-dashboard-recent-visits"),
    path("provider/dashboard/recent-patients/", ProviderRecentPatientsView.as_view(),
         name="provider-dashboard-recent-patients"),
    path("provider/reminders/", ProviderReminderLogView.as_view(),
         name="provider-reminders"),
    path("notifications/", NotificationListView.as_view(), name="notifications"),
    path('provider/update-password/', UpdatePasswordView.as_view(),
         name='provider-update-password'),
    path("provider/dashboard/", ProviderDashboardView.as_view(),
         name="provider-dashboard"),
    path("provider/appointments/", ProviderAppointmentsView.as_view(),
         name="provider-appointments"),


    # Mother profile & password
    path("mother/profile/", MotherProfileView.as_view(), name="mother-profile"),
    path("mother/profile/update/", MotherProfileUpdateView.as_view(),
         name="mother-profile-update"),
    path("mother/change-password/", MotherChangePasswordView.as_view(),
         name="mother-change-password"),

    # Mother appointments
    path("mother/appointments/", MotherAllAppointmentsView.as_view(),
         name="mother-appointments"),
    path("mother/next-appointment/", MotherNextAppointmentView.as_view(),
         name="mother-next-appointment"),

    # Mother notifications & alerts
    path("mother/notifications/", MotherNotificationListView.as_view(),
         name="mother-notifications"),
    path("mother/emergency/", MotherEmergencyAlertView.as_view(),
         name="mother-emergency"),
    path("mother/notifications/mark-read/<int:pk>/",
         MotherNotificationMarkReadView.as_view()),
    path("mother/notifications/mark-all-read/",
         MotherNotificationMarkReadView.as_view()),


    path("mother/dashboard/", MotherDashboardView.as_view(),
         name="mother-dashboard"),


    # Get Current User Information
    path("me/", get_me, name="get_me"),
    path("logout/", logout_view, name="logout"),
]
