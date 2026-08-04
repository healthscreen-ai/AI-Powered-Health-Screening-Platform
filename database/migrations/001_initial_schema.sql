CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    age INTEGER,
    gender VARCHAR(50),
    location VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS health_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    symptoms TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    predicted_condition VARCHAR(255) NOT NULL,
    confidence_score DOUBLE PRECISION NOT NULL,
    assessment_type VARCHAR(20) NOT NULL CHECK (assessment_type IN ('symptom', 'image')),
    image_path VARCHAR(500),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES health_assessments(id) ON DELETE CASCADE,
    suggested_specialist VARCHAR(255) NOT NULL,
    urgency_level VARCHAR(20) NOT NULL CHECK (urgency_level IN ('low', 'medium', 'high')),
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_health_assessments_user_id
    ON health_assessments(user_id);

CREATE INDEX IF NOT EXISTS idx_referrals_assessment_id
    ON referrals(assessment_id);
