from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes

from .models import (
    User,
    Resume,
    Application,
    CandidateProfile,
    RecruiterProfile,
    Job,
    SavedJob,
)

from .serializers import (
    UserRegistrationSerializer,
    ResumeSerializer,
    ApplicationSerializer,
    CandidateProfileSerializer,
    RecruiterProfileSerializer,
    JobSerializer,
)


# ==========================================
# USER REGISTRATION
# ==========================================

class UserRegistrationView(APIView):

    def post(self, request):

        serializer = UserRegistrationSerializer(
            data=request.data
        )

        if serializer.is_valid():

            user = serializer.save()

            return Response(
                {
                    "message": "User registered successfully",
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "role": user.role,
                    }
                },
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# ==========================================
# USER PROFILE
# ==========================================

class UserProfileView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        return Response(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
            },
            status=status.HTTP_200_OK
        )


# ==========================================
# UPLOAD RESUME
# ==========================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_resume(request):

    if "file" not in request.FILES:

        return Response(
            {
                "error": "Please select a resume file."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    uploaded_file = request.FILES["file"]

    allowed_extensions = [
        ".pdf",
        ".doc",
        ".docx",
    ]

    filename = uploaded_file.name.lower()

    if not any(
        filename.endswith(ext)
        for ext in allowed_extensions
    ):

        return Response(
            {
                "error": "Only PDF, DOC, and DOCX files are allowed."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # Maximum 5 MB

    if uploaded_file.size > 5 * 1024 * 1024:

        return Response(
            {
                "error": "File size must be less than 5 MB."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # Delete previous resume

    Resume.objects.filter(
        user=request.user
    ).delete()

    # Create new resume

    resume = Resume.objects.create(
        user=request.user,
        file=uploaded_file,
        original_filename=uploaded_file.name
    )

    serializer = ResumeSerializer(
        resume,
        context={"request": request}
    )

    return Response(
        {
            "message": "Resume uploaded successfully!",
            "resume": serializer.data,
        },
        status=status.HTTP_201_CREATED
    )

# ==========================================
# CHANGE PASSWORD
# ==========================================

@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def change_password(request):

    current_password = request.data.get("current_password")
    new_password = request.data.get("new_password")
    confirm_password = request.data.get("confirm_password")

    # Check required fields
    if not current_password or not new_password or not confirm_password:
        return Response(
            {
                "error": "All password fields are required."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # Check current password
    if not request.user.check_password(current_password):
        return Response(
            {
                "error": "Current password is incorrect."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # Check new password confirmation
    if new_password != confirm_password:
        return Response(
            {
                "error": "New passwords do not match."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # Check minimum password length
    if len(new_password) < 6:
        return Response(
            {
                "error": "New password must be at least 6 characters long."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # Prevent using the same password
    if current_password == new_password:
        return Response(
            {
                "error": "New password must be different from your current password."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # Set new password
    request.user.set_password(new_password)
    request.user.save()

    return Response(
        {
            "message": "Password changed successfully."
        },
        status=status.HTTP_200_OK
    )

# ==========================================
# GET RESUME
# ==========================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_resume(request):

    resume = Resume.objects.filter(
        user=request.user
    ).first()

    if not resume:

        return Response(
            {
                "message": "No resume uploaded yet."
            },
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = ResumeSerializer(
        resume,
        context={"request": request}
    )

    return Response(
        serializer.data,
        status=status.HTTP_200_OK
    )


# ==========================================
# DELETE RESUME
# ==========================================

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_resume(request):

    resume = Resume.objects.filter(
        user=request.user
    ).first()

    if not resume:

        return Response(
            {
                "error": "No resume found."
            },
            status=status.HTTP_404_NOT_FOUND
        )

    # Delete actual file

    if resume.file:

        resume.file.delete(
            save=False
        )

    # Delete database record

    resume.delete()

    return Response(
        {
            "message": "Resume deleted successfully!"
        },
        status=status.HTTP_200_OK
    )


# ==========================================
# APPLICATIONS
# ==========================================

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def applications(request):

    # ======================================
    # GET APPLICATIONS
    # ======================================

    if request.method == "GET":

        user_applications = Application.objects.filter(
            candidate=request.user
        ).order_by("-applied_at")

        serializer = ApplicationSerializer(
            user_applications,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    # ======================================
    # CREATE APPLICATION
    # ======================================

    if request.method == "POST":

        # Only candidates can apply

        if request.user.role != "candidate":

            return Response(
                {
                    "error": "Only candidates can apply for jobs."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = ApplicationSerializer(
            data=request.data
        )

        if serializer.is_valid():

            application = serializer.save(
                candidate=request.user
            )

            return Response(
                {
                    "message": "Application submitted successfully!",
                    "application": ApplicationSerializer(
                        application
                    ).data,
                },
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

# ==========================================
# RECRUITER APPLICATIONS
# ==========================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def recruiter_applications(request):

    # Only recruiters can access applications
    if request.user.role != "recruiter":
        return Response(
            {
                "error": "Only recruiters can view applications."
            },
            status=status.HTTP_403_FORBIDDEN
        )

    # Get recruiter profile
    try:
        recruiter_profile = RecruiterProfile.objects.get(
            user=request.user
        )
    except RecruiterProfile.DoesNotExist:
        return Response(
            {
                "error": "Recruiter profile not found."
            },
            status=status.HTTP_404_NOT_FOUND
        )

    # Get applications for this recruiter's jobs
    recruiter_applications = Application.objects.filter(
        job__recruiter=recruiter_profile
    ).select_related(
        "candidate",
        "job"
    ).order_by("-applied_at")

    serializer = ApplicationSerializer(
        recruiter_applications,
        many=True
    )

    return Response(
        serializer.data,
        status=status.HTTP_200_OK
    )    

# ==========================================
# RECRUITER DASHBOARD STATISTICS
# ==========================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def recruiter_dashboard_stats(request):

    # Only recruiters can access this endpoint
    if request.user.role != "recruiter":
        return Response(
            {
                "error": "Only recruiters can access recruiter dashboard statistics."
            },
            status=status.HTTP_403_FORBIDDEN
        )

    # Get recruiter profile
    try:
        recruiter_profile = RecruiterProfile.objects.get(
            user=request.user
        )
    except RecruiterProfile.DoesNotExist:
        return Response(
            {
                "error": "Recruiter profile not found."
            },
            status=status.HTTP_404_NOT_FOUND
        )

    # Get all applications for this recruiter's jobs
    recruiter_applications = Application.objects.filter(
        job__recruiter=recruiter_profile
    )

    # Total applications
    application_count = recruiter_applications.count()

    # Total interviews
    interview_count = recruiter_applications.filter(
        status="interview"
    ).count()

    # Return dashboard statistics
    return Response(
        {
            "application_count": application_count,
            "interview_count": interview_count,
        },
        status=status.HTTP_200_OK
    )

# ==========================================
# UPDATE APPLICATION STATUS
# ==========================================

@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_application_status(request, application_id):

    # Only recruiters can update application status
    if request.user.role != "recruiter":
        return Response(
            {
                "error": "Only recruiters can update application status."
            },
            status=status.HTTP_403_FORBIDDEN
        )

    # Get recruiter profile
    try:
        recruiter_profile = RecruiterProfile.objects.get(
            user=request.user
        )
    except RecruiterProfile.DoesNotExist:
        return Response(
            {
                "error": "Recruiter profile not found."
            },
            status=status.HTTP_404_NOT_FOUND
        )

    # Get application belonging to recruiter's job
    try:
        application = Application.objects.select_related(
            "candidate",
            "job"
        ).get(
            id=application_id,
            job__recruiter=recruiter_profile
        )
    except Application.DoesNotExist:
        return Response(
            {
                "error": "Application not found."
            },
            status=status.HTTP_404_NOT_FOUND
        )

    # Get new status
    new_status = request.data.get("status")

    allowed_statuses = [
        "applied",
        "reviewed",
        "interview",
        "rejected",
        "selected",
    ]

    # Validate status
    if new_status not in allowed_statuses:
        return Response(
            {
                "error": "Invalid application status.",
                "allowed_statuses": allowed_statuses,
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # Update status
    application.status = new_status
    application.save()

    # Return updated application
    serializer = ApplicationSerializer(application)

    return Response(
        {
            "message": "Application status updated successfully.",
            "application": serializer.data,
        },
        status=status.HTTP_200_OK
    )

# ==========================================
# CANDIDATE PROFILE
# ==========================================

class CandidateProfileView(APIView):

    permission_classes = [IsAuthenticated]

    # ======================================
    # GET
    # ======================================

    def get(self, request):

        if request.user.role != "candidate":

            return Response(
                {
                    "error": "Only candidates can access this profile."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        profile, created = CandidateProfile.objects.get_or_create(
            user=request.user
        )

        serializer = CandidateProfileSerializer(
            profile
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    # ======================================
    # PUT
    # ======================================

    def put(self, request):

        if request.user.role != "candidate":

            return Response(
                {
                    "error": "Only candidates can update this profile."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        profile, created = CandidateProfile.objects.get_or_create(
            user=request.user
        )

        serializer = CandidateProfileSerializer(
            profile,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                {
                    "message": "Candidate profile updated successfully.",
                    "profile": serializer.data,
                },
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# ==========================================
# RECRUITER PROFILE
# ==========================================

class RecruiterProfileView(APIView):

    permission_classes = [IsAuthenticated]

    # ======================================
    # GET
    # ======================================

    def get(self, request):

        if request.user.role != "recruiter":

            return Response(
                {
                    "error": "Only recruiters can access this profile."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        try:

            profile = RecruiterProfile.objects.get(
                user=request.user
            )

        except RecruiterProfile.DoesNotExist:

            return Response(
                {
                    "detail": "Recruiter profile not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = RecruiterProfileSerializer(
            profile
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    # ======================================
    # POST - CREATE PROFILE
    # ======================================

    def post(self, request):

        if request.user.role != "recruiter":

            return Response(
                {
                    "error": "Only recruiters can create a recruiter profile."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        if RecruiterProfile.objects.filter(
            user=request.user
        ).exists():

            return Response(
                {
                    "detail": "Recruiter profile already exists."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = RecruiterProfileSerializer(
            data=request.data
        )

        if serializer.is_valid():

            serializer.save(
                user=request.user
            )

            return Response(
                {
                    "message": "Recruiter profile created successfully.",
                    "profile": serializer.data,
                },
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    # ======================================
    # PUT - UPDATE PROFILE
    # ======================================

    def put(self, request):

        if request.user.role != "recruiter":

            return Response(
                {
                    "error": "Only recruiters can update this profile."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        try:

            profile = RecruiterProfile.objects.get(
                user=request.user
            )

        except RecruiterProfile.DoesNotExist:

            return Response(
                {
                    "detail": "Recruiter profile not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = RecruiterProfileSerializer(
            profile,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                {
                    "message": "Recruiter profile updated successfully.",
                    "profile": serializer.data,
                },
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# ==========================================
# JOB LIST + CREATE
# ==========================================

class JobListCreateView(APIView):

    permission_classes = [IsAuthenticated]

    # ======================================
    # GET ALL ACTIVE JOBS
    # ======================================

    def get(self, request):

        jobs = Job.objects.filter(
            is_active=True
        ).order_by("-created_at")

        serializer = JobSerializer(
            jobs,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    # ======================================
    # CREATE JOB
    # ======================================

    def post(self, request):

        # Only recruiters

        if request.user.role != "recruiter":

            return Response(
                {
                    "error": "Only recruiters can create jobs."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # Get recruiter profile

        try:

            recruiter_profile = RecruiterProfile.objects.get(
                user=request.user
            )

        except RecruiterProfile.DoesNotExist:

            return Response(
                {
                    "error": (
                        "Recruiter profile not found. "
                        "Please complete your recruiter profile first."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate job

        serializer = JobSerializer(
            data=request.data
        )

        if serializer.is_valid():

            job = serializer.save(
                recruiter=recruiter_profile
            )

            return Response(
                {
                    "message": "Job created successfully.",
                    "job": JobSerializer(job).data,
                },
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# ==========================================
# RECRUITER JOB MANAGEMENT
# ==========================================

class RecruiterJobsView(APIView):

    permission_classes = [IsAuthenticated]

    # ======================================
    # GET RECRUITER JOBS
    # ======================================

    def get(self, request):

        if request.user.role != "recruiter":

            return Response(
                {
                    "error": "Only recruiters can access this."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        try:

            recruiter_profile = RecruiterProfile.objects.get(
                user=request.user
            )

        except RecruiterProfile.DoesNotExist:

            return Response(
                {
                    "error": "Recruiter profile not found."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        jobs = Job.objects.filter(
            recruiter=recruiter_profile
        ).order_by("-created_at")

        serializer = JobSerializer(
            jobs,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    # ==========================================
    # DELETE RECRUITER JOB
    # ==========================================

    def delete(self, request, job_id):

        if request.user.role != "recruiter":
            return Response(
                {
                    "error": "Only recruiters can delete jobs."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            recruiter_profile = RecruiterProfile.objects.get(
                user=request.user
            )

        except RecruiterProfile.DoesNotExist:
            return Response(
                {
                    "error": "Recruiter profile not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            job = Job.objects.get(
                id=job_id,
                recruiter=recruiter_profile
            )

        except Job.DoesNotExist:
            return Response(
                {
                    "error": "Job not found or you do not have permission to delete it."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        job.delete()

        return Response(
            {
                "message": "Job deleted successfully."
            },
            status=status.HTTP_200_OK
        )
    
# ==========================================
# RECRUITER JOB MANAGEMENT
# ==========================================

class RecruiterJobsView(APIView):

    permission_classes = [IsAuthenticated]

    # ======================================
    # GET RECRUITER JOBS
    # ======================================

    def get(self, request):

        if request.user.role != "recruiter":

            return Response(
                {
                    "error": "Only recruiters can access this."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        try:

            recruiter_profile = RecruiterProfile.objects.get(
                user=request.user
            )

        except RecruiterProfile.DoesNotExist:

            return Response(
                {
                    "error": "Recruiter profile not found."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        jobs = Job.objects.filter(
            recruiter=recruiter_profile
        ).order_by("-created_at")

        serializer = JobSerializer(
            jobs,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    # ======================================
    # DELETE RECRUITER JOB
    # ======================================

    def delete(self, request, job_id):

        if request.user.role != "recruiter":

            return Response(
                {
                    "error": "Only recruiters can delete jobs."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        try:

            recruiter_profile = RecruiterProfile.objects.get(
                user=request.user
            )

        except RecruiterProfile.DoesNotExist:

            return Response(
                {
                    "error": "Recruiter profile not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        try:

            job = Job.objects.get(
                id=job_id,
                recruiter=recruiter_profile
            )

        except Job.DoesNotExist:

            return Response(
                {
                    "error": "Job not found or you do not have permission to delete it."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        job.delete()

        return Response(
            {
                "message": "Job deleted successfully."
            },
            status=status.HTTP_200_OK
        )

# ==========================================
# SAVED JOBS
# ==========================================

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def saved_jobs(request):

    # Only candidates can use saved jobs
    if request.user.role != "candidate":
        return Response(
            {
                "error": "Only candidates can manage saved jobs."
            },
            status=status.HTTP_403_FORBIDDEN
        )

    # ======================================
    # GET SAVED JOBS
    # ======================================

    if request.method == "GET":

        saved_jobs = SavedJob.objects.filter(
            candidate=request.user
        ).select_related(
            "job"
        ).order_by("-saved_at")

        data = []

        for saved_job in saved_jobs:

            job = saved_job.job

            data.append({
                "id": saved_job.id,
                "job": job.id,
                "title": job.title,
                "company_name": job.company_name,
                "description": job.description,
                "required_skills": job.required_skills,
                "location": job.location,
                "job_type": job.job_type,
                "salary": job.salary,
                "experience_required": job.experience_required,
                "is_active": job.is_active,
                "saved_at": saved_job.saved_at,
            })

        return Response(
            data,
            status=status.HTTP_200_OK
        )

    # ======================================
    # SAVE JOB
    # ======================================

    if request.method == "POST":

        job_id = request.data.get("job")

        if not job_id:
            return Response(
                {
                    "error": "Job ID is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:

            job = Job.objects.get(
                id=job_id,
                is_active=True
            )

        except Job.DoesNotExist:

            return Response(
                {
                    "error": "Job not found or no longer active."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # Prevent duplicate saves

        if SavedJob.objects.filter(
            candidate=request.user,
            job=job
        ).exists():

            return Response(
                {
                    "error": "You have already saved this job."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        saved_job = SavedJob.objects.create(
            candidate=request.user,
            job=job
        )

        return Response(
            {
                "message": "Job saved successfully.",
                "saved_job": {
                    "id": saved_job.id,
                    "job": job.id,
                    "title": job.title,
                }
            },
            status=status.HTTP_201_CREATED
        )


# ==========================================
# DELETE SAVED JOB
# ==========================================

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_saved_job(request, saved_job_id):

    # Only candidates can remove saved jobs
    if request.user.role != "candidate":
        return Response(
            {
                "error": "Only candidates can manage saved jobs."
            },
            status=status.HTTP_403_FORBIDDEN
        )

    try:

        saved_job = SavedJob.objects.get(
            id=saved_job_id,
            candidate=request.user
        )

    except SavedJob.DoesNotExist:

        return Response(
            {
                "error": "Saved job not found."
            },
            status=status.HTTP_404_NOT_FOUND
        )

    saved_job.delete()

    return Response(
        {
            "message": "Job removed from saved jobs."
        },
        status=status.HTTP_200_OK
    )