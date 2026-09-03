from django.urls import path

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import (
    UserRegistrationView,
    UserProfileView,
    upload_resume,
    get_resume,
    delete_resume,
    applications,
    recruiter_applications,
    update_application_status,
    CandidateProfileView,
    RecruiterProfileView,
    JobListCreateView,
    RecruiterJobsView,
    saved_jobs,
    delete_saved_job,
    recruiter_dashboard_stats,
)


urlpatterns = [

    # Authentication
    path(
        "register/",
        UserRegistrationView.as_view(),
        name="register"
    ),

    path(
        "login/",
        TokenObtainPairView.as_view(),
        name="login"
    ),

    path(
        "token/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh"
    ),

    # User
    path(
        "profile/",
        UserProfileView.as_view(),
        name="profile"
    ),

    # Resume
    path(
        "resume/upload/",
        upload_resume,
        name="upload_resume"
    ),

    path(
        "resume/",
        get_resume,
        name="get_resume"
    ),

    path(
        "resume/delete/",
        delete_resume,
        name="delete_resume"
    ),

    # Candidate applications
    path(
        "applications/",
        applications,
        name="applications"
    ),

    # Recruiter applications
    path(
        "recruiter/applications/",
        recruiter_applications,
        name="recruiter_applications"
    ),

    path(
        "recruiter/applications/<int:application_id>/status/",
        update_application_status,
        name="update_application_status"
    ),

    # Recruiter dashboard
    path(
        "recruiter/dashboard-stats/",
        recruiter_dashboard_stats,
        name="recruiter_dashboard_stats"
    ),

    # Candidate profile
    path(
        "candidate-profile/",
        CandidateProfileView.as_view(),
        name="candidate_profile"
    ),

    # Recruiter profile
    path(
        "recruiter-profile/",
        RecruiterProfileView.as_view(),
        name="recruiter_profile"
    ),

    # Jobs
    path(
        "jobs/",
        JobListCreateView.as_view(),
        name="jobs"
    ),

    path(
        "recruiter/jobs/",
        RecruiterJobsView.as_view(),
        name="recruiter_jobs"
    ),

    path(
        "recruiter/jobs/<int:job_id>/",
        RecruiterJobsView.as_view(),
        name="delete_recruiter_job"
    ),

    # Saved jobs
    path(
        "saved-jobs/",
        saved_jobs,
        name="saved_jobs"
    ),

    path(
        "saved-jobs/<int:saved_job_id>/",
        delete_saved_job,
        name="delete_saved_job"
    ),
]