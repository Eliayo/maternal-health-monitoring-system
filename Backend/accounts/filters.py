import django_filters
from .models import ActivityLog, User
# from django.db.models import Q


class ActivityLogFilter(django_filters.FilterSet):
    actor = django_filters.NumberFilter(field_name='actor__id')

    class Meta:
        model = ActivityLog
        fields = ['action', 'actor']


# class MotherFilter(django_filters.FilterSet):
#     search = django_filters.CharFilter(method='filter_search', label='Search')
#     start_date = django_filters.DateFilter(
#         field_name='date_joined', lookup_expr='gte')
#     end_date = django_filters.DateFilter(
#         field_name='date_joined', lookup_expr='lte')

#     class Meta:
#         model = User
#         fields = ['search', 'start_date', 'end_date']

#     def filter_search(self, queryset, name, value):
#         return queryset.filter(
#             Q(first_name__icontains=value) |
#             Q(last_name__icontains=value) |
#             Q(custom_id__icontains=value) |
#             Q(phone_number__icontains=value)
#         )

class MotherFilter(django_filters.FilterSet):
    date_joined = django_filters.DateFromToRangeFilter()

    class Meta:
        model = User
        fields = ['date_joined']
