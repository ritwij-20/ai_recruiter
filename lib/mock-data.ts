import { Job, Application } from '@/types/recruiter';

export const INITIAL_JOBS: Job[] = [
  {
    id: 'job-swe-01',
    title: 'Senior Full Stack Software Engineer',
    company: 'Starlight Cloud Systems',
    location: 'San Francisco, CA',
    workMode: 'Hybrid',
    employmentType: 'Full-time',
    experienceRange: '3-5 years',
    salaryRange: '$140,000 - $175,000',
    department: 'Engineering',
    description: 'We are seeking a seasoned Full Stack Software Engineer to build resilient distributed web services and intuitive client interfaces for our cloud orchestration platform. You will design scalable APIs, optimize relational datastores, and lead architecture decisions across our modern React and Node/Python stacks.',
    responsibilities: [
      'Architect, develop, and maintain high-throughput backend services in Python and Node.js.',
      'Build responsive, accessible frontend workflows using React, TypeScript, and modern styling libraries.',
      'Optimize relational PostgreSQL and SQL databases for fast analytical queries and robust transactional guarantees.',
      'Collaborate with product managers and infrastructure engineers on CI/CD pipelines and cloud microservices.',
      'Mentor junior engineers and champion clean code standards, automated testing, and security best practices.'
    ],
    mandatoryRequirements: [
      'Python',
      'React',
      'SQL / Relational Databases',
      'Git & Version Control'
    ],
    preferredRequirements: [
      'AWS / Cloud Architecture',
      'Docker & Container Orchestration',
      'GraphQL or gRPC API design',
      'Next.js & Server-side rendering'
    ],
    educationRequirements: "Bachelor's degree in Computer Science, Software Engineering, or equivalent practical industry experience.",
    status: 'active',
    createdAt: '2026-09-18T10:30:00Z',
    updatedAt: '2026-09-24T14:15:00Z',
    applicationsCount: 14,
    topMatchScore: 94
  },
  {
    id: 'job-ml-02',
    title: 'Applied Machine Learning Engineer',
    company: 'Cognitive Data Labs',
    location: 'New York, NY',
    workMode: 'Remote',
    employmentType: 'Full-time',
    experienceRange: '2-4 years',
    salaryRange: '$150,000 - $185,000',
    department: 'AI & Data Science',
    description: 'Cognitive Data Labs is hiring an Applied ML Engineer to deploy and evaluate production neural ranking models and document comprehension pipelines. You will translate research algorithms into low-latency inference services.',
    responsibilities: [
      'Train, fine-tune, and evaluate deep learning and NLP models using PyTorch and Hugging Face.',
      'Deploy containerized inference pipelines on Kubernetes with automated drift monitoring.',
      'Extract structured entities from unstructured business documents with high precision.',
      'Partner with data engineers to build robust feature extraction pipelines.'
    ],
    mandatoryRequirements: [
      'Python',
      'PyTorch or TensorFlow',
      'Machine Learning Foundations (NLP / Transformers)',
      'Docker'
    ],
    preferredRequirements: [
      'Kubernetes',
      'Vector Databases (Milvus, Pinecone)',
      'MLflow or Kubeflow pipeline experience'
    ],
    educationRequirements: "Bachelor's or Master's in Computer Science, Data Science, Math, or related STEM field.",
    status: 'active',
    createdAt: '2026-09-21T08:00:00Z',
    updatedAt: '2026-09-28T11:00:00Z',
    applicationsCount: 9,
    topMatchScore: 91
  },
  {
    id: 'job-devops-03',
    title: 'Platform & DevOps Engineer',
    company: 'Vanguard Infrastructure',
    location: 'Austin, TX',
    workMode: 'Hybrid',
    employmentType: 'Full-time',
    experienceRange: '4-7 years',
    salaryRange: '$135,000 - $165,000',
    department: 'DevOps & SRE',
    description: 'Looking for a Platform Engineer to automate multi-region cloud topology, enforce Zero-Trust networking, and scale our Kubernetes clusters across AWS and GCP.',
    responsibilities: [
      'Manage Infrastructure as Code using Terraform and Helm charts.',
      'Maintain 99.99% system uptime across multi-region production clusters.',
      'Implement observability with Prometheus, Grafana, and OpenTelemetry.'
    ],
    mandatoryRequirements: [
      'Kubernetes',
      'Terraform',
      'AWS or GCP Cloud Architecture',
      'CI/CD Pipelines (GitHub Actions / GitLab CI)'
    ],
    preferredRequirements: [
      'Go or Python scripting',
      'ArgoCD / GitOps',
      'Security Compliance (SOC2 / ISO 27001)'
    ],
    educationRequirements: 'Relevant degree or equivalent production engineering experience.',
    status: 'active',
    createdAt: '2026-09-25T13:45:00Z',
    updatedAt: '2026-09-25T13:45:00Z',
    applicationsCount: 7,
    topMatchScore: 86
  },
  {
    id: 'job-pm-04',
    title: 'Technical Product Manager — Platform',
    company: 'Nexus Scale Technologies',
    location: 'Seattle, WA',
    workMode: 'Remote',
    employmentType: 'Full-time',
    experienceRange: '3-6 years',
    salaryRange: '$130,000 - $160,000',
    department: 'Product',
    description: 'Lead API strategy and developer-facing toolchains. Define roadmaps, align engineering velocity with enterprise client deliverables, and drive developer adoption metrics.',
    responsibilities: [
      'Synthesize customer feedback into detailed PRDs and technical specifications.',
      'Partner closely with Staff Engineers to scope feature complexity.',
      'Track developer portal metrics, API usage drop-offs, and SLA adherence.'
    ],
    mandatoryRequirements: [
      'Product Strategy & Technical PRDs',
      'API Architecture Understanding',
      'Agile / Scrum Leadership',
      'Data Analytics & SQL'
    ],
    preferredRequirements: [
      'Prior software engineering background',
      'Enterprise SaaS experience',
      'Jira & Linear workflow design'
    ],
    educationRequirements: "Bachelor's degree in Business, Computer Science, or equivalent experience.",
    status: 'draft',
    createdAt: '2026-09-27T09:00:00Z',
    updatedAt: '2026-09-27T09:00:00Z',
    applicationsCount: 0,
    topMatchScore: undefined
  },
  {
    id: 'job-frontend-05',
    title: 'Lead Frontend UI/UX Engineer',
    company: 'Prism Interactive',
    location: 'Boston, MA',
    workMode: 'On-site',
    employmentType: 'Full-time',
    experienceRange: '5+ years',
    salaryRange: '$145,000 - $180,000',
    department: 'Product Design & Eng',
    description: 'Drive high-fidelity interface design systems, web performance, and micro-interactions for enterprise financial reporting suites.',
    responsibilities: [
      'Own frontend component architecture in Next.js, React 19, and Tailwind.',
      'Enforce WCAG 2.1 AA accessibility and cross-browser responsiveness.',
      'Audit bundle size and render execution pipelines.'
    ],
    mandatoryRequirements: [
      'React / Next.js',
      'TypeScript',
      'CSS Architecture & Tailwind CSS',
      'Design Systems & Web Accessibility'
    ],
    preferredRequirements: [
      'Figma-to-Code mastery',
      'WebGL / Canvas visualization',
      'State management (Zustand / Redux Toolkit)'
    ],
    educationRequirements: "Bachelor's in Design, Computer Science, or self-taught portfolio proof.",
    status: 'closed',
    createdAt: '2026-08-10T11:00:00Z',
    updatedAt: '2026-09-15T16:20:00Z',
    applicationsCount: 22,
    topMatchScore: 96
  }
];

export const INITIAL_APPLICATIONS: Application[] = [
  {
    id: 'app-rahul-01',
    jobId: 'job-swe-01',
    candidateName: 'Rahul Kumar',
    email: 'rahul.kumar@example.com',
    phone: '+1 (555) 234-8901',
    educationLevel: "Bachelor's in Computer Science",
    collegeUniversity: 'University of California, Berkeley',
    yearsOfExperience: 3.5,
    skills: ['Python', 'React', 'SQL', 'PostgreSQL', 'Git', 'Flask', 'TypeScript', 'Docker', 'REST APIs'],
    additionalInfo: 'Passionate about distributed system reliability and clean API architecture. Built production internal services handling 5M daily queries.',
    resumeFileName: 'Rahul_Kumar_Software_Engineer_Resume.pdf',
    resumeFileSize: '240 KB',
    appliedAt: '2026-09-20T14:22:00Z',
    status: 'shortlisted',
    analysis: {
      candidateSummary: 'Rahul is a strong candidate for this Software Engineer position. His resume demonstrates direct experience with Python, React, SQL and Git, covering all four mandatory technical requirements. He also has approximately 3.5 years of relevant development experience, which aligns directly with the 3-5 years range.',
      overallScore: 94,
      recommendation: 'STRONG MATCH',
      scoreBreakdown: {
        skillsMatch: 96,
        experienceMatch: 92,
        educationMatch: 100,
        projectRelevance: 90,
        semanticRelevance: 95,
        claimConfidence: 97
      },
      keyStrengths: [
        'Satisfies 100% of mandatory requirements (Python, React, SQL, Git).',
        'Strong practical evidence: built a Flask-based inventory system and React dashboard in production.',
        'Documented experience in optimizing PostgreSQL queries and indexing strategies.',
        'Clean employment timeline with verifiable duration and verified project outcomes.'
      ],
      missingRequirements: [
        'AWS / Cloud Architecture is unverified in production (only basic sandbox usage noted).',
        'No direct gRPC or GraphQL implementation documented.'
      ],
      skillsAnalysis: 'Covers all 4 mandatory requirements with verifiable production experience. Possesses bonus experience with Docker and TypeScript.',
      experienceAnalysis: '3.5 years of progressive full-stack development at a mid-stage SaaS company. Contributed to core service refactors and automated CI testing.',
      educationAnalysis: 'BS in Computer Science from UC Berkeley aligns with or exceeds the education requirement.',
      projectAnalysis: 'Featured project "Cloudventory" demonstrates end-to-end Python/Flask microservices connected to React frontend with automated GitHub Actions.',
      evidenceList: [
        {
          requirement: 'Python',
          isMandatory: true,
          isMatched: true,
          matchLevel: 'Strong Match',
          evidenceFound: 'Maintained core data ingestion workers written in Python 3.11 with SQLAlchemy ORM.',
          aiInterpretation: 'Direct production backend development evidence.'
        },
        {
          requirement: 'React',
          isMandatory: true,
          isMatched: true,
          matchLevel: 'Strong Match',
          evidenceFound: 'Architected company client portal in React & TypeScript with 120+ reusable components.',
          aiInterpretation: 'Demonstrates modern functional React state and design system integration.'
        },
        {
          requirement: 'SQL / Relational Databases',
          isMandatory: true,
          isMatched: true,
          matchLevel: 'Strong Match',
          evidenceFound: 'Authored complex analytical SQL queries, partitioned tables, and indexing benchmarks on PostgreSQL.',
          aiInterpretation: 'Validates both schema design and performance query tuning capability.'
        },
        {
          requirement: 'Git & Version Control',
          isMandatory: true,
          isMatched: true,
          matchLevel: 'Strong Match',
          evidenceFound: 'Managed team branching policies, trunk-based PR reviews, and automated release tags.',
          aiInterpretation: 'Substantiates standard collaborative engineering workflow mastery.'
        },
        {
          requirement: 'AWS / Cloud Architecture',
          isMandatory: false,
          isMatched: false,
          matchLevel: 'Unverified',
          evidenceFound: 'Listed in skills section but no specific EC2/S3/ECS architectural responsibilities detailed.',
          aiInterpretation: 'ClaimGuard flagged for verification during technical interview.'
        }
      ],
      claimGuard: {
        overallStatus: 'Verified & Supported',
        summary: 'All core technical and tenure claims are substantiated by documented project contributions and company records. No chronological gaps or contradictions detected.',
        items: [
          {
            id: 'cg-1',
            claim: '3.5 years professional full-stack development',
            status: 'SUPPORTED',
            evidence: 'Employment timeline from June 2023 to present at Apex Systems correlates with claimed duration.',
            reasoning: 'Dates and graduation timestamp are chronologically consistent.'
          },
          {
            id: 'cg-2',
            claim: 'Hands-on Python & React production delivery',
            status: 'SUPPORTED',
            evidence: 'Documented features shipped in production and GitHub repository references.',
            reasoning: 'Detailed commit history and component descriptions substantiate competency.'
          },
          {
            id: 'cg-3',
            claim: 'AWS Cloud Architecture',
            status: 'UNVERIFIED',
            evidence: 'AWS listed in skills list, but work achievements do not describe VPC, IAM, or Terraform configs.',
            reasoning: 'Insufficient evidence found in resume body. Recommended for technical discussion.'
          }
        ]
      }
    }
  },
  {
    id: 'app-aman-02',
    jobId: 'job-swe-01',
    candidateName: 'Aman Sharma',
    email: 'aman.sharma@example.com',
    phone: '+1 (555) 891-4432',
    educationLevel: "Bachelor's in Information Technology",
    collegeUniversity: 'Georgia Institute of Technology',
    yearsOfExperience: 4.0,
    skills: ['Python', 'SQL', 'AWS', 'Docker', 'Kubernetes', 'FastAPI', 'Git', 'Linux'],
    additionalInfo: 'Specialized in cloud backend architectures, container orchestration, and high-reliability data pipelines.',
    resumeFileName: 'Aman_Sharma_Backend_Cloud_Resume.pdf',
    resumeFileSize: '310 KB',
    appliedAt: '2026-09-21T09:15:00Z',
    status: 'in_review',
    analysis: {
      candidateSummary: 'Aman has exceptional backend and AWS infrastructure experience, with deep expertise in Python, SQL, and Docker. However, his frontend React experience is relatively lightweight compared to full-stack expectations, requiring consideration of his ability to lead user-facing features.',
      overallScore: 88,
      recommendation: 'GOOD MATCH',
      scoreBreakdown: {
        skillsMatch: 86,
        experienceMatch: 94,
        educationMatch: 95,
        projectRelevance: 84,
        semanticRelevance: 89,
        claimConfidence: 96
      },
      keyStrengths: [
        'Superior cloud and DevOps capability (AWS ECS, Terraform, Docker, Kubernetes).',
        'Advanced Python development using FastAPI and async event processing.',
        'Solid database performance tuning on AWS RDS Aurora PostgreSQL.'
      ],
      missingRequirements: [
        'React is mentioned only in academic coursework and internal admin dashboards.',
        'Limited evidence of modern client-side state architectures.'
      ],
      skillsAnalysis: 'Satisfies 3 of 4 mandatory requirements (Python, SQL, Git). React requirement is partially satisfied through secondary tools.',
      experienceAnalysis: '4 years of robust backend and cloud engineering. Strong history of reducing service latency by 35%.',
      educationAnalysis: 'BS in IT from Georgia Tech matches standard technical degree expectations.',
      projectAnalysis: 'Kubernetes autoscaling deployment showcase and telemetry ingestion pipeline.',
      evidenceList: [
        {
          requirement: 'Python',
          isMandatory: true,
          isMatched: true,
          matchLevel: 'Strong Match',
          evidenceFound: 'Architected async FastAPI ingestion workers servicing 20,000 req/sec.',
          aiInterpretation: 'Exceeds Python backend expectations.'
        },
        {
          requirement: 'React',
          isMandatory: true,
          isMatched: false,
          matchLevel: 'Partial Match',
          evidenceFound: 'Maintained internal debug tools in React 17.',
          aiInterpretation: 'Satisfies basic familiarity, but lacks deep production design system experience.'
        },
        {
          requirement: 'AWS / Cloud Architecture',
          isMandatory: false,
          isMatched: true,
          matchLevel: 'Strong Match',
          evidenceFound: 'Certified AWS Solutions Architect with multi-AZ VPC deployments.',
          aiInterpretation: 'Strong value-add preferred qualification.'
        }
      ],
      claimGuard: {
        overallStatus: 'Verified & Supported',
        summary: 'Cloud certifications and employment dates verified. Honest self-reporting of backend specialization.',
        items: [
          {
            id: 'cg-aman-1',
            claim: 'AWS Solutions Architect Associate',
            status: 'SUPPORTED',
            evidence: 'Certificate ID and issuance date provided in certification block.',
            reasoning: 'Verifiable credential.'
          }
        ]
      }
    }
  },
  {
    id: 'app-priya-03',
    jobId: 'job-swe-01',
    candidateName: 'Priya Patel',
    email: 'priya.patel@example.com',
    phone: '+1 (555) 762-1092',
    educationLevel: "Master's in Computer Science",
    collegeUniversity: 'Stanford University',
    yearsOfExperience: 3.0,
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind', 'GraphQL', 'Node.js', 'SQL', 'Git'],
    additionalInfo: 'Passionate UI/UX and full stack engineer with a strong focus on design systems, web accessibility, and scalable React architectures.',
    resumeFileName: 'Priya_Patel_FullStack_Resume.pdf',
    resumeFileSize: '190 KB',
    appliedAt: '2026-09-22T11:40:00Z',
    status: 'shortlisted',
    analysis: {
      candidateSummary: 'Priya possesses outstanding frontend engineering capabilities in React, Next.js, and TypeScript, backed by an MS in Computer Science from Stanford. Her primary backend stack is Node.js rather than Python, but semantic analysis indicates high adaptability given her solid SQL and API design background.',
      overallScore: 84,
      recommendation: 'GOOD MATCH',
      scoreBreakdown: {
        skillsMatch: 82,
        experienceMatch: 88,
        educationMatch: 100,
        projectRelevance: 88,
        semanticRelevance: 85,
        claimConfidence: 95
      },
      keyStrengths: [
        'Top-tier frontend architecture (React 19, Next.js, WCAG 2.1 AA compliant design systems).',
        'Master of Science in Computer Science from Stanford University.',
        'Strong SQL and GraphQL schema design abilities.'
      ],
      missingRequirements: [
        'Python is listed as secondary language; production projects were authored primarily in TypeScript/Node.js.',
        'Limited container orchestration experience.'
      ],
      skillsAnalysis: 'Satisfies 3 of 4 mandatory requirements strongly (React, SQL, Git). Python is conceptual rather than heavy production.',
      experienceAnalysis: '3 years at a high-growth fintech startup delivering customer checkout funnels.',
      educationAnalysis: 'MS CS from Stanford University comfortably exceeds education benchmarks.',
      projectAnalysis: 'Open source component library with 1,200 GitHub stars and thorough documentation.',
      evidenceList: [
        {
          requirement: 'React',
          isMandatory: true,
          isMatched: true,
          matchLevel: 'Strong Match',
          evidenceFound: 'Principal author of fintech checkout redesign resulting in +18% conversion rate.',
          aiInterpretation: 'World-class frontend execution evidence.'
        },
        {
          requirement: 'Python',
          isMandatory: true,
          isMatched: false,
          matchLevel: 'Partial Match',
          evidenceFound: 'Academic data processing scripts written in Python during graduate research.',
          aiInterpretation: 'Adequate syntactical knowledge, but lacks large-scale Python production exposure.'
        }
      ],
      claimGuard: {
        overallStatus: 'Verified & Supported',
        summary: 'All academic credentials and open-source contributions are publicly verifiable.',
        items: [
          {
            id: 'cg-priya-1',
            claim: 'Stanford MS in Computer Science',
            status: 'SUPPORTED',
            evidence: 'Graduation year and thesis title documented clearly.',
            reasoning: 'Consistent chronological timeline.'
          }
        ]
      }
    }
  },
  {
    id: 'app-vikram-04',
    jobId: 'job-swe-01',
    candidateName: 'Vikram Malhotra',
    email: 'vikram.m@example.com',
    phone: '+1 (555) 431-8820',
    educationLevel: "Bachelor's in Electronics",
    collegeUniversity: 'State Polytechnic Institute',
    yearsOfExperience: 5.0,
    skills: ['Python', 'Django', 'React', 'AWS', 'Docker', 'PostgreSQL'],
    additionalInfo: 'Senior full stack consultant with broad multi-tier architectural knowledge across various startups.',
    resumeFileName: 'Vikram_Malhotra_CV_2026.docx',
    resumeFileSize: '410 KB',
    appliedAt: '2026-09-23T16:05:00Z',
    status: 'in_review',
    analysis: {
      candidateSummary: 'Vikram demonstrates familiar buzzwords matching the job profile, but ClaimGuard identified significant discrepancies between the summary claim of "5 years of senior enterprise experience" and the documented job entries, which total only 2.3 years of full-time professional employment.',
      overallScore: 67,
      recommendation: 'REVIEW',
      scoreBreakdown: {
        skillsMatch: 75,
        experienceMatch: 60,
        educationMatch: 70,
        projectRelevance: 68,
        semanticRelevance: 72,
        claimConfidence: 54
      },
      keyStrengths: [
        'Familiar with Django and React project structures.',
        'Experience working in startup environments.'
      ],
      missingRequirements: [
        'Documented experience falls short of the required 3-5 years range.',
        'Production scale and throughput metrics are absent from project descriptions.'
      ],
      skillsAnalysis: 'Keywords are present, but project descriptions lack depth on concurrency, caching, or distributed system trade-offs.',
      experienceAnalysis: 'Resume lists 5 years in summary, but detailed employment dates reflect 14 months at Company A and 12 months at Company B.',
      educationAnalysis: 'Electronics degree satisfies general STEM expectation.',
      projectAnalysis: 'Portfolio references standard boilerplate tutorial clones without custom enterprise extensions.',
      evidenceList: [
        {
          requirement: 'Python',
          isMandatory: true,
          isMatched: true,
          matchLevel: 'Partial Match',
          evidenceFound: 'Built CRUD endpoints in Django for internal ticket tracking.',
          aiInterpretation: 'Basic API familiarity demonstrated.'
        }
      ],
      claimGuard: {
        overallStatus: 'Potential Inconsistencies',
        summary: 'Significant chronological disparity detected. The candidate claims 5 years of professional experience, but documented work history spans only 2 years and 3 months.',
        items: [
          {
            id: 'cg-vikram-1',
            claim: '5 Years Enterprise Full Stack Experience',
            status: 'POTENTIALLY CONTRADICTORY',
            evidence: 'Detailed job dates: March 2024 - Present (approx 18 mos), and Jan 2023 - Nov 2023 (11 mos). Total: ~2.4 years.',
            reasoning: 'Documented work history does not support the headline 5-year claim.'
          },
          {
            id: 'cg-vikram-2',
            claim: 'Architected High-Load AWS Microservices',
            status: 'UNVERIFIED',
            evidence: 'No specific AWS architectural design, load figures, or tooling (Terraform/CloudFormation) detailed.',
            reasoning: 'Claim lacks substantiating project or duty details.'
          }
        ]
      }
    }
  },
  {
    id: 'app-david-05',
    jobId: 'job-swe-01',
    candidateName: 'David Chen',
    email: 'david.chen@example.com',
    phone: '+1 (555) 321-9988',
    educationLevel: 'Bootcamp Graduate',
    collegeUniversity: 'CodeForge Academy',
    yearsOfExperience: 1.0,
    skills: ['HTML', 'CSS', 'JavaScript', 'Basic React', 'Git'],
    additionalInfo: 'Recent bootcamp graduate eager to join an engineering team and grow my technical abilities.',
    resumeFileName: 'David_Chen_Resume.pdf',
    resumeFileSize: '150 KB',
    appliedAt: '2026-09-24T08:12:00Z',
    status: 'applied',
    analysis: {
      candidateSummary: 'David is an enthusiastic entry-level developer with 1 year of bootcamp preparation. However, he is missing the mandatory Python requirement and does not satisfy the 3-5 years minimum experience threshold required for this Senior role.',
      overallScore: 48,
      recommendation: 'NOT RECOMMENDED',
      scoreBreakdown: {
        skillsMatch: 45,
        experienceMatch: 35,
        educationMatch: 60,
        projectRelevance: 55,
        semanticRelevance: 50,
        claimConfidence: 90
      },
      keyStrengths: [
        'Honest and transparent presentation of junior background.',
        'Basic React and Git skills in place.'
      ],
      missingRequirements: [
        'Missing mandatory Python requirement completely.',
        'Missing mandatory SQL / Relational database experience.',
        'Substantially below 3-5 years experience threshold.'
      ],
      skillsAnalysis: 'Only 2 of 4 mandatory requirements met at a beginner level.',
      experienceAnalysis: '1 year bootcamp capstone experience. Better suited for Junior/Intern roles.',
      educationAnalysis: 'Bootcamp certification without degree or equivalent multi-year industry practice.',
      projectAnalysis: 'Capstone todo app and weather widget.',
      evidenceList: [
        {
          requirement: 'Python',
          isMandatory: true,
          isMatched: false,
          matchLevel: 'Missing',
          evidenceFound: 'No mention of Python or server-side backend development in resume.',
          aiInterpretation: 'Core requirement unmet.'
        }
      ],
      claimGuard: {
        overallStatus: 'Verified & Supported',
        summary: 'Candidate claims match documented entry-level history accurately without exaggeration.',
        items: [
          {
            id: 'cg-david-1',
            claim: '1 year coding experience',
            status: 'SUPPORTED',
            evidence: 'Bootcamp graduation dates align with claimed timeframe.',
            reasoning: 'Accurately represented.'
          }
        ]
      }
    }
  }
];

export const RECRUITER_STATS = {
  activeJobs: 3,
  totalJobs: 5,
  totalApplications: 46,
  candidatesAnalyzed: 38,
  candidatesShortlisted: 12,
  needsReview: 6
};
