# AI Resume & Job Matching System

An AI-powered recruitment platform that helps recruiters analyze resumes, match candidates with job requirements, and intelligently shortlist applicants using Google Gemini AI.

## Problem Statement

Recruiters often spend significant time manually screening large numbers of resumes. Traditional keyword-based screening can miss relevant candidates and provides little insight into why a candidate is suitable for a role.

## Solution

The AI Resume & Job Matching System uses Gemini AI to analyze resumes against specific job requirements and provides:

- AI-powered resume analysis
- Evidence-based candidate matching
- Match scores and recommendations
- Requirement-level explanations
- Missing or weak requirement detection
- Claim verification support
- Automated candidate ranking and shortlisting

The system assists recruiters in making faster and more informed decisions while keeping the final hiring decision with the recruiter.

## Key Features

### AI Resume Intelligence
Automatically extracts and analyzes:

- Skills
- Education
- Work experience
- Projects
- Certifications
- Relevant evidence from resumes

### AI Job Matching
Compares candidate profiles with job requirements and generates:

- Match score
- Match strength
- Recommendation
- Requirement-by-requirement analysis
- Supporting evidence

### AI Shortlisting
Recruiters can analyze all applicants with a single action. Candidates are automatically processed, scored, and ranked according to their relevance to the job.

### Evidence-Based Matching
AI explanations are backed by information found in the candidate's resume rather than relying only on keyword similarity.

### ClaimGuard
Identifies claims or qualifications that may require verification and avoids making unsupported conclusions.

### Job Management
Recruiters can:

- Create jobs
- Edit jobs
- Publish jobs
- Close jobs
- Define required and preferred qualifications
- Manage applicants

### Candidate Applications
Candidates can:

- Browse available jobs
- View job details
- Apply for positions
- Upload PDF or DOCX resumes
- Provide additional application information

## Technology Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend & Database
- Firebase Authentication
- Firebase Firestore
- Next.js API Routes

### Artificial Intelligence
- Google Gemini API
- Google AI Studio

### Resume Processing
- `unpdf` – PDF text extraction
- `mammoth` – DOCX text extraction

### Deployment & Development
- Vercel
- GitHub
- Google AI Studio

## System Workflow

```text
Candidate
   |
   v
Browse Jobs
   |
   v
Apply + Upload Resume
   |
   v
Resume Parsing
   |
   v
AI Resume Intelligence
   |
   v
AI Job Matching
   |
   v
Requirement Analysis
   |
   v
Match Score + Explanation
   |
   v
Candidate Ranking
   |
   v
Recruiter Shortlist
