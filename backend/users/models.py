from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings


# ==========================================
# CUSTOM USER
# ==========================================

class User(AbstractUser):

    ROLE_CHOICES = (
        ("candidate", "Candidate"),
        ("recruiter", "Recruiter"),
        ("admin", "Admin"),
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="candidate"
    )

    def __str__(self):
        return self.username


# ==========================================
# CANDIDATE PROFILE
# ==========================================

class CandidateProfile(models.Model):

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="candidate_profile"
    )

    phone = models.CharField(
        max_length=20,
        blank=True
    )

    location = models.CharField(
        max_length=255,
        blank=True
    )

    skills = models.TextField(
        blank=True
    )

    experience_years = models.PositiveIntegerField(
        default=0
    )

    education = models.TextField(
        blank=True
    )

    resume = models.FileField(
        upload_to="resumes/",
        blank=True,
        null=True
    )

    def __str__(self):
        return self.user.username


# ==========================================
# RECRUITER PROFILE
# ==========================================

class RecruiterProfile(models.Model):

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="recruiter_profile"
    )

    company_name = models.CharField(
        max_length=255
    )

    company_website = models.URLField(
        blank=True
    )

    company_description = models.TextField(
        blank=True
    )

    company_location = models.CharField(
        max_length=255,
        blank=True
    )

    def __str__(self):
        return self.company_name


# ==========================================
# RESUME
# ==========================================

class Resume(models.Model):

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="resumes"
    )

    file = models.FileField(
        upload_to="resumes/"
    )

    original_filename = models.CharField(
        max_length=255
    )

    uploaded_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.user.username} - {self.original_filename}"


# ==========================================
# JOB
# ==========================================

class Job(models.Model):

    JOB_TYPE_CHOICES = (
        ("full-time", "Full Time"),
        ("part-time", "Part Time"),
        ("internship", "Internship"),
        ("contract", "Contract"),
    )

    recruiter = models.ForeignKey(
        RecruiterProfile,
        on_delete=models.CASCADE,
        related_name="jobs"
    )

    title = models.CharField(
        max_length=255
    )

    company_name = models.CharField(
        max_length=255
    )

    description = models.TextField()

    required_skills = models.TextField(
        blank=True
    )

    location = models.CharField(
        max_length=255,
        blank=True
    )

    job_type = models.CharField(
        max_length=20,
        choices=JOB_TYPE_CHOICES,
        default="full-time"
    )

    salary = models.CharField(
        max_length=100,
        blank=True
    )

    experience_required = models.PositiveIntegerField(
        default=0
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    is_active = models.BooleanField(
        default=True
    )

    def __str__(self):
        return self.title


# ==========================================
# JOB APPLICATION
# ==========================================

class Application(models.Model):

    STATUS_CHOICES = (
        ("applied", "Applied"),
        ("reviewed", "Reviewed"),
        ("interview", "Interview"),
        ("rejected", "Rejected"),
        ("selected", "Selected"),
    )

    candidate = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="applications"
    )

    # Link application to actual Job
    job = models.ForeignKey(
    Job,
    on_delete=models.CASCADE,
    related_name="applications",
    null=True,
    blank=True
   )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="applied"
    )

    applied_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        # Prevent the same candidate from applying
        # to the same job multiple times
        constraints = [
            models.UniqueConstraint(
                fields=["candidate", "job"],
                name="unique_candidate_job_application"
            )
        ]

    def __str__(self):
        return f"{self.candidate.username} - {self.job.title}"

# ==========================================
# SAVED JOBS
# ==========================================

class SavedJob(models.Model):

    candidate = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="saved_jobs"
    )

    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name="saved_by"
    )

    saved_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["candidate", "job"],
                name="unique_candidate_saved_job"
            )
        ]

        ordering = ["-saved_at"]

    def __str__(self):
        return f"{self.candidate.username} - {self.job.title}"    