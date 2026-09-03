from django.contrib import admin

from .models import (
    User,
    CandidateProfile,
    RecruiterProfile,
    Resume,
    Application,
    Job,
)


admin.site.register(User)
admin.site.register(CandidateProfile)
admin.site.register(RecruiterProfile)
admin.site.register(Resume)
admin.site.register(Application)
admin.site.register(Job)