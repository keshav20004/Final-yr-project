# Project Synopsis

## AI-Powered Answer Sheet Evaluation System (AIEVAL)

**Project Title:** AI-Powered Answer Sheet Evaluation System Using Vision-Language Models

**Domain:** Artificial Intelligence, Natural Language Processing, Computer Vision, Education Technology (EdTech)

**Academic Year:** 2025–2026

---

## 1. Introduction

The **AI Answer Sheet Evaluator (AIEVAL)** is an intelligent web-based system that automates the evaluation of handwritten and printed university-level answer sheets using state-of-the-art Vision-Language AI models. The system accepts question papers, student answer sheets, and optional model answer keys as PDF documents, then performs a comprehensive evaluation — reading handwriting, diagrams, equations, and printed text — and produces detailed, structured reports with marks, feedback, suggestions, and interactive dashboards.

Manual evaluation of answer sheets is a time-consuming, labour-intensive, and often inconsistent process. AIEVAL aims to solve these problems by leveraging cutting-edge AI to provide fast, unbiased, and highly detailed evaluations, empowering both educators and students with actionable feedback.

---

## 2. Problem Statement

The traditional method of evaluating answer sheets in academic institutions suffers from several critical issues:

- **Time-Intensive:** Professors and evaluators spend extensive hours manually grading hundreds of answer sheets.
- **Inconsistency & Bias:** Human evaluators may grade differently depending on fatigue, mood, or personal bias, leading to unfair scoring.
- **Lack of Detailed Feedback:** Due to time constraints, students rarely receive granular, question-by-question feedback with improvement suggestions.
- **Scalability Issues:** Large class sizes make it almost impossible to provide personalized evaluation at scale.
- **Delayed Results:** Slow manual processing leads to delayed results, reducing the feedback's utility for student learning.

---

## 3. Objectives

1. **Automate answer sheet evaluation** using AI vision and language models that can read handwritten content, printed text, diagrams, mathematical equations, and charts.
2. **Generate structured evaluation reports** with question-wise marks, suggestions for improvement, and identification of shortcomings.
3. **Provide interactive dashboards** with visual analytics (charts, graphs) for understanding performance at a glance.
4. **Support optional model answer keys** for gold-standard grading accuracy.
5. **Handle complex exam patterns** including optional questions, section-level choices ("answer any 3 out of 5"), and internal OR choices.
6. **Ensure data privacy and security** through secure user authentication using Clerk.
7. **Export evaluation reports** as downloadable PDF documents.
8. **Provide a modern, accessible, and responsive** user interface for seamless user experience across devices.

---

## 4. Scope of the Project

### In Scope:
- PDF upload and processing of question papers and answer sheets
- AI-powered evaluation using Groq (Llama 4 Scout) and Google Gemini 2.0 Flash models
- Vision-based document analysis (reading handwriting, diagrams, equations)
- Structured evaluation reports with marks, suggestions, and shortcomings per question
- Interactive evaluation dashboards with Doughnut and Bar charts
- Improvement strategy with action plans, technical gap analysis, and presentation tips
- User authentication and secure access via Clerk
- PDF export of evaluation reports
- Responsive, modern web UI with 3D animations

### Out of Scope:
- Real-time video-based proctoring
- Integration with Learning Management Systems (LMS) like Moodle
- Batch processing of multiple students in one go (single student evaluation per session)
- Multi-language answer sheet support (currently optimized for English)
- Offline evaluation (requires internet for API access)

---

## 5. Technology Stack

| Layer             | Technology                                           | Purpose                                      |
|-------------------|------------------------------------------------------|----------------------------------------------|
| **Frontend**      | React 19, TypeScript                                 | Component-based UI with type safety          |
| **Build Tool**    | Vite 6                                               | Fast development server and bundling         |
| **Styling**       | TailwindCSS (CDN)                                    | Utility-first responsive design              |
| **Authentication**| Clerk (@clerk/clerk-react)                           | Secure user sign-in/sign-up with OAuth       |
| **AI/LLM**       | Groq API (Llama 4 Scout 17B 16E Instruct)            | Vision-capable LLM for answer evaluation     |
| **AI/LLM (Alt)** | Google Gemini 2.0 Flash (@google/genai)              | Alternative vision-capable model             |
| **PDF Processing**| PDF.js (pdfjs-dist v3.11)                            | Client-side PDF rendering and page extraction|
| **LaTeX Rendering**| KaTeX v0.16                                         | Mathematical equation rendering in reports   |
| **Charts**        | Chart.js 4 + react-chartjs-2                         | Doughnut and Bar chart visualizations        |
| **3D Graphics**   | Three.js + React Three Fiber + React Three Drei      | Immersive 3D scenes on landing page          |
| **Smooth Scroll** | Lenis                                                | Butter-smooth scrolling on landing page      |
| **PDF Export**    | jsPDF + html2canvas                                  | Exporting evaluation reports as PDF files    |

---

## 6. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│                                                                 │
│  ┌────────────┐    ┌──────────────┐    ┌────────────────────┐   │
│  │ Landing    │    │ Evaluator    │    │ Dashboard          │   │
│  │ Page       │    │ Page         │    │ (Charts + Analysis)│   │
│  │ (3D Scene) │    │ (File Upload)│    │                    │   │
│  └────────────┘    └──────┬───────┘    └────────┬───────────┘   │
│                           │                     │               │
│                    ┌──────▼───────┐    ┌────────▼───────────┐   │
│                    │ PDF Service  │    │ Report Parser      │   │
│                    │ (pdf.js)     │    │ (Text → Structured)│   │
│                    │ PDF → Images │    │                    │   │
│                    └──────┬───────┘    └────────────────────┘   │
│                           │                                     │
│                    ┌──────▼───────┐                              │
│                    │ Groq/Gemini  │                              │
│                    │ Service      │                              │
│                    │ (API Client) │                              │
│                    └──────┬───────┘                              │
│                           │                                     │
└───────────────────────────┼─────────────────────────────────────┘
                            │ HTTPS API Calls
               ┌────────────▼────────────┐
               │   External AI APIs      │
               │                         │
               │  ┌──────────────────┐   │
               │  │ Groq API         │   │
               │  │ (Llama 4 Scout)  │   │
               │  └──────────────────┘   │
               │                         │
               │  ┌──────────────────┐   │
               │  │ Google Gemini    │   │
               │  │ (2.0 Flash)     │   │
               │  └──────────────────┘   │
               │                         │
               │  ┌──────────────────┐   │
               │  │ Clerk Auth       │   │
               │  │ Service          │   │
               │  └──────────────────┘   │
               └─────────────────────────┘
```

---

## 7. Module Description

### Module 1: Landing Page & Authentication
- Premium, dark-themed landing page with **3D animated scenes** (using Three.js, React Three Fiber)
- Smooth scroll experience powered by **Lenis**
- Feature showcase, workflow steps, statistics bar, and CTA sections
- **Clerk-based authentication** (Sign In / Sign Up with OAuth support)
- Protected routes — only authenticated users can access the evaluator

### Module 2: PDF Upload & Processing
- Users upload three documents: **Question Paper** (required), **Answer Sheet** (required), and **Model Answer Key** (optional)
- PDF files are processed entirely **client-side** using **PDF.js**
- For Groq: PDF pages are rendered to canvas, then **stitched into composite images** (max 5 images total) as base64-encoded JPEGs
- For Gemini: PDFs are sent directly as base64-encoded inline data (native PDF support)
- Intelligent image budget allocation: QP gets 2 slots, AS gets 2–3 slots, MA gets 0–1 slot

### Module 3: AI Evaluation Engine
- A carefully engineered **evaluation prompt** instructs the AI to:
  - Read and parse the question paper to extract individual questions and their marks
  - Locate corresponding student answers from the answer sheet
  - Evaluate answers for **correctness, depth, structure, and completeness**
  - Handle **section-level choices** ("answer any 3 out of 5") by scoring only the best N answers
  - Handle **internal OR choices** (e.g., "6a OR 6b") by awarding marks only to the higher-scoring part
  - Generate structured output with **marks, suggestions, and shortcomings** per question
  - Produce an **overall summary** with total score, performance assessment, strengths, and improvement areas
- Supports **two AI backends**: Groq (Llama 4 Scout — vision via images) and Google Gemini 2.0 Flash (native PDF vision)

### Module 4: Evaluation Report Display
- Renders the AI-generated evaluation as beautifully formatted report cards
- Each question section includes: question text, student's answer, marks awarded, suggestions, and shortcomings
- **LaTeX math rendering** via KaTeX for mathematical equations in the report
- Report sections are separated by visual dividers with hover effects

### Module 5: Interactive Dashboard
- **Doughnut Chart**: Overall score visualization (marks obtained vs. lost)
- **Stacked Bar Chart**: Question-by-question marks breakdown
- **Detailed Question Accordion**: Expandable sections with full feedback per question
- **Improvement Strategy** panel with:
  - ⚠ Key Shortcomings (technical gaps identified across answers)
  - ✎ Top Suggestions (presentation and content improvement tips)
  - ☑ Interactive Action Plan (checkable to-do list generated from AI feedback)
- **Overall Assessment** banner with key strengths highlighted

### Module 6: PDF Export
- Users can **download the evaluation report as a PDF** file
- Uses **html2canvas** to capture the rendered report as a high-quality image
- Uses **jsPDF** to generate a multi-page A4 PDF from the captured image
- Supports both light and dark mode report capture

---

## 8. Data Flow / Working Process

1. **User signs in** via Clerk authentication (Google, email, or other OAuth providers).
2. **User uploads PDF files** — Question Paper (mandatory), Answer Sheet (mandatory), and Model Answer Key (optional).
3. **PDF Processing**:
   - PDF pages are rendered to canvas elements using PDF.js at 1.5x scale.
   - Pages are stitched into composite images to stay within the AI model's image limits (5 images for Groq).
   - Images are encoded as base64 JPEG strings.
4. **API Call**: The base64 images (or raw PDF data for Gemini) are sent to the AI API along with a detailed, prompt-engineered evaluation instruction.
5. **AI Evaluation**: The vision-language model reads all documents, matches questions to answers, evaluates each answer, and returns a structured evaluation report.
6. **Report Rendering**: The raw text report is rendered with LaTeX support and formatted into styled report cards.
7. **Report Parsing**: The `reportParser` service extracts structured data (scores, suggestions, shortcomings) from the text report.
8. **Dashboard Generation**: Parsed data is used to generate interactive charts and improvement strategies.
9. **PDF Export**: User can optionally download the report as a PDF document.

---

## 9. Key Features

| #  | Feature                                | Description                                                                 |
|----|----------------------------------------|-----------------------------------------------------------------------------|
| 1  | Vision-Capable AI Evaluation           | Reads handwriting, diagrams, equations, printed text from scanned PDFs      |
| 2  | Multi-Model Support                    | Works with both Groq (Llama 4 Scout) and Google Gemini 2.0 Flash           |
| 3  | Smart Choice Handling                  | Handles "answer any N" and "OR" question patterns intelligently             |
| 4  | Detailed Question-wise Feedback        | Marks, suggestions, and shortcomings for each individual question           |
| 5  | Interactive Dashboard                  | Doughnut and Bar charts with expandable question analysis                   |
| 6  | Personalized Action Plans              | AI-generated improvement checklist based on evaluation results              |
| 7  | LaTeX Math Rendering                   | Renders mathematical formulas beautifully using KaTeX                       |
| 8  | PDF Export                             | Download evaluation reports as formatted PDF documents                      |
| 9  | Secure Authentication                  | Clerk-based sign-in with OAuth and session management                       |
| 10 | Premium Landing Page                   | 3D animated scenes, smooth scrolling, modern glassmorphism design           |
| 11 | Responsive Design                      | Works seamlessly across desktop, tablet, and mobile devices                 |
| 12 | Client-Side PDF Processing             | No server needed for PDF parsing — all processing happens in the browser    |
| 13 | Model Answer Support                   | Optional gold-standard answer key for more accurate grading                 |
| 14 | Dark Mode Support                      | Full dark mode UI throughout the application                                |

---

## 10. Advantages

1. **Speed & Efficiency**: Evaluates an entire answer sheet in under 30 seconds, compared to 15–30 minutes of manual grading per paper.
2. **Consistency & Fairness**: AI applies the same evaluation criteria uniformly across all answer sheets, eliminating human bias.
3. **Rich, Actionable Feedback**: Students receive detailed suggestions and shortcomings for every question — far more than what manual grading typically provides.
4. **Scalability**: Can evaluate unlimited answer sheets without fatigue; no degradation in quality over time.
5. **Cost-Effective**: Free to use for individual users (within API free-tier limits), drastically reducing evaluation costs for institutions.
6. **Privacy-Conscious**: All PDF processing happens client-side in the browser; documents are not stored on any server.
7. **Modern, Intuitive UI**: Premium, visually stunning interface with 3D animations that provides a best-in-class user experience.
8. **Visual Analytics**: Interactive charts and dashboards make performance analysis intuitive and engaging.
9. **Multi-Model Flexibility**: Supports multiple AI backends (Groq, Gemini), providing resilience and choice.
10. **No Installation Required**: Fully web-based application — works on any device with a modern browser.
11. **Smart Exam Pattern Support**: Automatically handles complex exam structures (optional questions, OR choices) — a capability rare in existing tools.
12. **Mathematical Competency**: Can evaluate STEM subjects with LaTeX-rendered equations and scientific notation.

---

## 11. Disadvantages / Limitations

1. **Internet Dependency**: Requires an active internet connection to access AI APIs (Groq/Gemini) and Clerk authentication.
2. **API Rate Limits**: Free-tier AI API usage is subject to rate limits (e.g., Groq: 30 requests/minute, 1,000 requests/day on the developer plan).
3. **Token/Context Limits**: Very long answer sheets with many pages may exceed the model's maximum token context (128K tokens for Llama 4 Scout, 8192 max output tokens).
4. **Handwriting Recognition Accuracy**: While vision models are advanced, heavily illegible or unconventional handwriting may be misread. Accuracy depends on document scan quality.
5. **Language Support**: Currently optimized for English-language answer sheets only.
6. **Single Student Per Session**: Evaluates one student's answer sheet at a time; no batch processing for multiple students simultaneously.
7. **No Persistent Storage**: Evaluation results are not stored server-side; refreshing the page or logging out clears the current evaluation. Users must download the PDF to save.
8. **Image Limit Constraint (Groq)**: The Groq API limits to 5 images per request, requiring page stitching for multi-page PDFs, which may reduce image clarity.
9. **AI Hallucination Risk**: Vision-language models may occasionally misinterpret content or generate incorrect feedback, requiring human review.
10. **No LMS Integration**: Does not currently integrate with institutional Learning Management Systems (e.g., Moodle, Canvas).
11. **No Plagiarism Detection**: The system evaluates answer quality but does not check for copied or plagiarized content.
12. **Cost at Scale**: While free for limited use, high-volume institutional usage would require paid API plans.

---

## 12. Future Enhancements

1. **Batch Processing**: Support uploading multiple answer sheets for bulk evaluation in a single session.
2. **Multi-Language Support**: Extend to support Hindi, regional languages, and other international languages.
3. **LMS Integration**: Integrate with Moodle, Google Classroom, Canvas, and other institutional platforms.
4. **Persistent Results Storage**: Add a backend database (e.g., Firebase, Supabase) to store and retrieve past evaluations.
5. **Plagiarism Detection**: Integrate plagiarism checking tools for cross-referencing answers against a database.
6. **Fine-Tuned Models**: Train custom AI models on domain-specific answer sheets for higher accuracy.
7. **Offline Mode**: Implement offline evaluation with smaller, locally-runnable models (e.g., using WebLLM).
8. **Comparative Analytics**: Allow comparing performance across students, sections, or exam attempts over time.
9. **Rubric Customization**: Let educators define custom rubrics and grading criteria that the AI follows.
10. **Audio Feedback**: Generate audio summaries of evaluation using text-to-speech for accessibility.

---

## 13. System Requirements

### Hardware Requirements:
| Component        | Minimum Specification                        |
|------------------|----------------------------------------------|
| Processor        | Intel Core i3 / AMD Ryzen 3 or equivalent    |
| RAM              | 4 GB (8 GB recommended)                      |
| Storage          | 500 MB free disk space                       |
| Internet         | Broadband connection (1 Mbps minimum)        |
| Display          | 1280 × 720 resolution minimum                |

### Software Requirements:
| Component        | Requirement                                   |
|------------------|-----------------------------------------------|
| Operating System | Windows 10+, macOS 11+, Linux (any modern)    |
| Web Browser      | Chrome 90+, Firefox 90+, Edge 90+, Safari 15+ |
| Node.js          | v18+ (for development and local hosting)       |
| npm              | v9+ (for dependency management)                |

---

## 14. Project File Structure

```
Final-yr-project/
├── index.html                  # Main HTML entry point
├── index.tsx                   # React app entry (Clerk + ReactDOM)
├── App.tsx                     # Main application component (routing, state)
├── types.ts                    # TypeScript type definitions
├── constants.ts                # Application constants
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite build configuration
├── .env                        # Environment variables (API keys)
├── .env.example                # Template for environment variables
│
├── components/
│   ├── LandingPage.tsx         # Landing page with 3D scenes and features
│   ├── HeroScene.tsx           # 3D hero animation (Three.js)
│   ├── CtaScene.tsx            # 3D CTA section animation
│   ├── EvaluationReport.tsx    # Renders evaluation report with LaTeX
│   ├── Dashboard.tsx           # Interactive dashboard (charts, action plan)
│   ├── FileInput.tsx           # PDF file upload component
│   └── icons/                  # SVG icon components
│       ├── SparklesIcon.tsx
│       ├── LoaderIcon.tsx
│       └── DownloadIcon.tsx
│
├── services/
│   ├── groqService.ts          # Groq API integration (Llama 4 Scout)
│   ├── geminiService.ts        # Google Gemini API integration
│   ├── pdfService.ts           # PDF processing (rendering, stitching)
│   └── reportParser.ts         # Parses AI report into structured data
│
└── dist/                       # Production build output
```

---

## 15. Use Case Diagram

```
                    ┌─────────────────────┐
                    │     AI EVAL System   │
                    └─────────┬───────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   ┌────▼─────┐         ┌────▼─────┐         ┌────▼─────┐
   │ Student  │         │ Educator │         │  Admin   │
   └────┬─────┘         └────┬─────┘         └────┬─────┘
        │                     │                     │
   ┌────▼──────────┐    ┌────▼──────────┐    ┌────▼──────────┐
   │ Sign In       │    │ Sign In       │    │ Manage API    │
   │ Upload PDFs   │    │ Upload PDFs   │    │ Keys          │
   │ View Report   │    │ View Report   │    │               │
   │ View Dashboard│    │ View Dashboard│    └───────────────┘
   │ Download PDF  │    │ Download PDF  │
   │ Action Plan   │    │ Use Model Ans │
   └───────────────┘    └───────────────┘
```

---

## 16. Testing Strategy

| Test Type           | Description                                                                | Status    |
|---------------------|----------------------------------------------------------------------------|-----------|
| Unit Testing        | Individual service functions (PDF parsing, report parsing)                 | Manual    |
| Integration Testing | End-to-end flow from PDF upload to report display                          | Manual    |
| UI/UX Testing       | Responsive design verification across devices and browsers                 | Manual    |
| API Testing         | Groq and Gemini API call validation with various PDF types                 | Manual    |
| Edge Case Testing   | Empty PDFs, very large PDFs, illegible handwriting, scanned vs. digital    | Manual    |
| Authentication      | Sign in, sign out, protected routes, session management                    | Manual    |

---

## 17. Conclusion

The **AI-Powered Answer Sheet Evaluation System (AIEVAL)** demonstrates how modern vision-language AI models can transform academic evaluation. By automating the tedious process of grading answer sheets, the system delivers consistent, detailed, and actionable feedback in seconds — a task that traditionally takes substantial human effort. The combination of client-side PDF processing, powerful cloud AI models, interactive dashboards, and a premium user interface makes AIEVAL a practical and innovative solution for the education sector.

This project showcases the intersection of **Artificial Intelligence**, **Computer Vision**, **Natural Language Processing**, and **Modern Web Development**, providing meaningful contributions to the field of Education Technology (EdTech).

---

## 18. References

1. Meta AI. (2025). *Llama 4 Scout 17B 16E Instruct* — Vision-capable large language model. Groq API.
2. Google DeepMind. (2025). *Gemini 2.0 Flash* — Multimodal AI model. Google AI Studio.
3. Mozilla Foundation. *PDF.js* — PDF rendering library for JavaScript. https://mozilla.github.io/pdf.js/
4. Chart.js Contributors. *Chart.js v4* — JavaScript charting library. https://www.chartjs.org/
5. Clerk Inc. *Clerk Authentication* — User management and authentication. https://clerk.com/
6. Khan, A. et al. (2025). *KaTeX* — Fast math typesetting for the web. https://katex.org/
7. Three.js Contributors. *Three.js* — 3D JavaScript library. https://threejs.org/
8. Vite Contributors. *Vite* — Next-generation frontend build tool. https://vitejs.dev/
9. React Team. *React 19* — JavaScript library for building user interfaces. https://react.dev/

---

*Prepared by: Keshav Bajpai*
*Date: March 2026*
