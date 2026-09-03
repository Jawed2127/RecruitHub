from rest_framework import serializers

from .models import (
    User,
    CandidateProfile,
    RecruiterProfile,
    Resume,
    Application,
    Job,
)


# ==========================================
# USER REGISTRATION
# ==========================================

class UserRegistrationSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        min_length=6
    )

    class Meta:
        model = User

        fields = [
            "id",
            "username",
            "email",
            "password",
            "role",
        ]

        read_only_fields = [
            "id",
        ]

    def create(self, validated_data):

        password = validated_data.pop("password")

        user = User.objects.create_user(
            password=password,
            **validated_data
        )

        # Automatically create the correct profile
        if user.role == "candidate":
            CandidateProfile.objects.get_or_create(
                user=user
            )

        elif user.role == "recruiter":
            # Recruiter profile requires company_name,
            # so it will be created from the recruiter profile page.
            pass

        return user


# ==========================================
# RESUME SERIALIZER
# ==========================================

class ResumeSerializer(serializers.ModelSerializer):

    class Meta:
        model = Resume

        fields = [
            "id",
            "file",
            "original_filename",
            "uploaded_at",
        ]

        read_only_fields = [
            "id",
            "original_filename",
            "uploaded_at",
        ]

# ==========================================
# APPLICATION SERIALIZER
# ==========================================

class ApplicationSerializer(serializers.ModelSerializer):

    candidate_username = serializers.CharField(
        source="candidate.username",
        read_only=True
    )

    candidate_email = serializers.EmailField(
        source="candidate.email",
        read_only=True
    )

    job_title = serializers.CharField(
        source="job.title",
        read_only=True
    )

    company_name = serializers.CharField(
        source="job.company_name",
        read_only=True
    )

    class Meta:
        model = Application

        fields = [
            "id",
            "job",
            "job_title",
            "company_name",
            "candidate_username",
            "candidate_email",
            "status",
            "applied_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "job_title",
            "company_name",
            "candidate_username",
            "candidate_email",
            "status",
            "applied_at",
            "updated_at",
        ]

# ==========================================
# CANDIDATE PROFILE SERIALIZER
# ==========================================

class CandidateProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = CandidateProfile

        fields = [
            "id",
            "phone",
            "location",
            "skills",
            "experience_years",
            "education",
            "resume",
        ]

        read_only_fields = [
            "id",
        ]


# ==========================================
# RECRUITER PROFILE SERIALIZER
# ==========================================

class RecruiterProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = RecruiterProfile

        fields = [
            "id",
            "company_name",
            "company_website",
            "company_description",
            "company_location",
        ]

        read_only_fields = [
            "id",
        ]


# ==========================================
# JOB SERIALIZER
# ==========================================

class JobSerializer(serializers.ModelSerializer):

    class Meta:
        model = Job

        fields = [
            "id",
            "title",
            "company_name",
            "description",
            "required_skills",
            "location",
            "job_type",
            "salary",
            "experience_required",
            "created_at",
            "updated_at",
            "is_active",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]