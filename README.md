# Pए — From Craft to Market

> An AI-powered digital commerce enablement platform that helps artisans transform handmade products into structured, verified, priced, and market-ready digital products.


---

## Problem Statement

Artisans often have strong craft skills but face significant barriers when entering digital commerce.

Turning a physical handmade product into a market-ready digital product requires information such as:

- Product name and category
- Materials and attributes
- Dimensions and weight
- Usage and care instructions
- Crafting time
- Pricing
- Product descriptions
- Market-specific information

These workflows can be difficult for artisans who may not be familiar with digital commerce tools.

## Pए's Core Idea

An artisan should not need to understand digital commerce to participate in it.

Pए bridges the gap between craft capability and digital commerce capability by converting a physical craft product into a structured and market-ready digital product through an AI-assisted workflow.

---

# What is Pए?

Pए (Pa-E) is an AI-powered productization platform designed for artisans.

Instead of asking an artisan to manually complete complex commerce forms, Pए guides them through a simple workflow:

```text
Product Photo + Voice
        |
        v
AI Productization
        |
        v
Product Passport
        |
        v
Voice Product Interview
        |
        v
Verification
        |
        v
Explainable Pricing
        |
        v
Adaptive Market Pack
        |
        v
Pre-Rejection Check
        |
        v
Market-Ready Product

Key Features
1. AI Productization

Pए converts a product photo and artisan input into a structured digital product draft.

The system can generate:

Product title
Category
Description
Tags
Product attributes
Structured product information

The system distinguishes between reliable product facts and information that requires confirmation.

AI-generated assumptions are not silently treated as artisan-confirmed facts.

2. Voice Product Interview
Core Innovation

Pए detects missing or incomplete product information and asks the artisan only the questions required to complete the product record.

This is not simply speech-to-text.

The workflow is:

Detect Missing Information
        |
        v
Generate Targeted Question
        |
        v
Artisan Answers by Voice
        |
        v
Transcribe Answer
        |
        v
Extract Structured Information
        |
        v
Update Product Passport
        |
        v
Repeat if Required

The interview can:

Detect missing product fields
Generate targeted questions
Accept voice answers
Convert answers into structured information
Allow the artisan to correct answers
Update the Product Passport
Stop once the required information threshold is reached
3. Product Passport and Verification

The Product Passport is the canonical structured record for a product.

It allows artisans to:

Review product information
Edit information
Confirm product facts
Track product completeness
Verify product details

The Product Passport provides the stable product representation used by the downstream features.

4. Explainable Pricing Assistant

Pए provides a transparent suggested price or price range rather than presenting a black-box "perfect price".

Pricing can consider inputs such as:

Raw material cost
Artisan or labor cost
Crafting time
Other costs
Product attributes
Available reference signals

The result includes an explanation of the factors contributing to the suggested price range.

The pricing system is designed to be transparent and bounded rather than claiming perfect image-based price prediction.

5. Adaptive Market Pack
Core Innovation

A single verified product can be transformed into multiple market-specific representations.

Example:

                    Product Passport
                           |
             +-------------+-------------+
             |             |             |
             v             v             v
      Online Listing   Institutional   Social /
                       Catalogue       Commerce

Each market pack can contain adapted:

Titles
Descriptions
Attributes
Tags
Presentation information

All market packs remain traceable to the same canonical Product Passport.

The prototype focuses on demonstrating market adaptation rather than live marketplace publishing.

Pए does not claim live publishing to GeM, ONDC, IndiaHandmade, or other marketplaces in the prototype.

6. Pre-Rejection Simulator
Core Innovation

The Pre-Rejection Simulator checks a generated market pack against a defined prototype ruleset before submission.

It can identify:

Missing information
Invalid or weak values
Readiness issues
Market-pack inconsistencies

Instead of simply returning a pass or fail result, the simulator explains what needs to be fixed.

Example:

Issue Detected

Missing product weight.

Recommended Fix

Add the verified product weight and run
the validation again.

The simulator uses deterministic prototype rules.

It does not claim to universally predict whether a real marketplace will reject a product.

7. Market Linkage and Opportunities

Pए also demonstrates the direction toward relevant channels, programs, and opportunities.

The prototype uses curated opportunity cards rather than depending on live marketplace integrations.

Opportunity cards can explain why a particular opportunity may be relevant to a product or category.

This feature is intentionally lightweight in the SIH prototype.

End-to-End Demo Journey

The complete Pए prototype journey is:

Step	Stage	What Happens
1	Capture	Artisan uploads a product photo and provides a voice description
2	Productize	AI creates a structured product draft
3	Interview	Pए asks targeted questions for missing information
4	Verify	Artisan reviews and confirms the product information
5	Price	Explainable Pricing Assistant provides a suggested range
6	Adapt	Adaptive Market Pack creates market-specific versions
7	Validate	Pre-Rejection Simulator checks the selected market pack
8	Explore	Relevant opportunity and channel cards are displayed

The goal is to demonstrate the complete journey from a physical craft product to a structured, market-ready digital product.

System Architecture
+-----------------------------+
|       Artisan / User        |
+--------------+--------------+
               |
               v
+-----------------------------+
|       React + Vite UI       |
+--------------+--------------+
               |
               | REST API
               v
+-----------------------------+
|      Node.js + Express      |
+-----------------------------+
| Authentication              |
| Product APIs                |
| Productization              |
| Voice Interview             |
| Pricing                     |
| Market Pack Generation      |
| Validation Rules             |
+--------------+--------------+
               |
        +------+------+
        |             |
        v             v
+---------------+  +----------------+
|    MongoDB    |  |   OpenRouter   |
|   Mongoose    |  |       AI       |
+---------------+  +----------------+
Technology Stack
Layer	Technology
Frontend	React + Vite
Backend	Node.js + Express
Database	MongoDB + Mongoose
AI	OpenRouter
Authentication	JWT + bcrypt
File Uploads	Multer
Voice Capture	Browser MediaRecorder API
HTTP Client	Axios
Frontend Deployment	Vercel
Backend Deployment	Render
Version Control	Git + GitHub
Backend Architecture

The backend follows a modular structure separating routes, controllers, services, models, middleware, and validation.

server/
|
+-- config/
|   +-- db.js
|   +-- env.js
|
+-- controllers/
|   +-- authController.js
|   +-- productController.js
|   +-- interviewController.js
|   +-- marketController.js
|   +-- pricingController.js
|
+-- middleware/
|   +-- authMiddleware.js
|   +-- uploadMiddleware.js
|   +-- errorMiddleware.js
|
+-- models/
|   +-- User.js
|   +-- Product.js
|   +-- ProductPassport.js
|   +-- InterviewSession.js
|   +-- MarketPack.js
|   +-- PricingAssessment.js
|
+-- routes/
|   +-- authRoutes.js
|   +-- productRoutes.js
|   +-- interviewRoutes.js
|   +-- marketPackRoutes.js
|   +-- pricingRoutes.js
|
+-- services/
|   +-- aiService.js
|   +-- productService.js
|   +-- interviewService.js
|   +-- marketPackService.js
|   +-- pricingService.js
|   +-- validationService.js
|   +-- voiceService.js
|
+-- utils/
|   +-- validators.js
|   +-- normalizeProduct.js
|   +-- apiResponse.js
|
+-- uploads/
|
+-- app.js
+-- server.js
API Overview
Authentication
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
Products
POST   /api/products
GET    /api/products
GET    /api/products/:id
PUT    /api/products/:id
DELETE /api/products/:id

POST /api/products/:id/productize
Product Interview
POST /api/products/:id/interview/start
GET  /api/products/:id/interview
POST /api/products/:id/interview/answer
POST /api/products/:id/interview/voice
POST /api/products/:id/interview/complete
Market Packs
POST /api/products/:id/market-packs
GET  /api/products/:id/market-packs
GET  /api/market-packs/:id
POST /api/market-packs/:id/validate
Pricing
POST /api/products/:id/pricing
GET  /api/products/:id/pricing
Health Check
GET /api/health
Product Data Flow

The Product Passport is the canonical product representation.

Product
   |
   v
AI Productization
   |
   v
Product Passport Draft
   |
   v
Missing Information Detection
   |
   v
Voice Product Interview
   |
   v
Updated Product Passport
   |
   v
Artisan Review
   |
   v
Verification
   |
   +-------------------+
   |                   |
   v                   v
Pricing           Market Pack
   |                   |
   |                   v
   |             Pre-Rejection
   |                   |
   +---------+---------+
             |
             v
      Market-Ready Product
Reliability and Error Handling

Pए follows the principle:

Reliability beats feature count.

AI operations should provide:

Loading states
Success states
Failure states
Recoverable errors
Retry paths
Structured output validation
User correction
Safe persistence

The system should never claim that an operation completed when the underlying operation failed.

Examples of recoverable failures include:

AI provider failure
Speech transcription failure
Image upload failure
Database failure
Malformed AI output
Partial product processing

AI-generated structured output is validated before being persisted.

Security and Privacy

The prototype follows basic security and privacy principles:

Provider API keys remain on the backend
Secrets are stored using environment variables
Frontend code does not contain private API keys
Authenticated API access is used
Uploaded files are validated
Only required artisan and product information should be stored
Sensitive personal documents are not required for the public demo
Demo data should have a cleanup/deletion path
Prototype Scope

Pए deliberately focuses on a coherent working vertical slice rather than attempting to build a complete marketplace.

Full Features
AI Productization
Voice Product Interview
Adaptive Market Pack
Explainable Pricing Assistant
Pre-Rejection Simulator
Lightweight Supporting Features
Product Passport and Verification
Market Linkage and Opportunities

The approximately 70% prototype target refers to the depth of implemented product scope, not a percentage of screens or code completed.

What Pए Does Not Build

Pए is not a marketplace clone.

The SIH prototype does not include:

Buyer accounts
Shopping cart
Checkout
Payment processing
Order management
Fulfilment or logistics
Live marketplace scraping
Live GeM publishing
Live ONDC publishing
Live IndiaHandmade publishing
Black-box perfect-price prediction
A separate chatbot
A large administrative dashboard

The focus is on helping an artisan convert a craft product into a structured and market-ready digital product.

Target Users
Primary Users
Individual artisans
Traditional craft workers
Handmade product creators
Small artisan groups
Institutional Users

Pए can also be deployed through organizations supporting artisans, such as:

NGOs
Self Help Groups
Government programs
Artisan organizations
CSR initiatives

The intended business model is institution-funded and artisan-first.

Business Model

The planned business model focuses on keeping artisan access free or highly affordable while allowing supporting institutions to fund deployments.

Potential revenue channels include:

Institutional licensing
CSR and sponsored artisan access
Usage-based AI credits
Optional artisan premium plans
Future ecosystem partnerships

The primary focus is institutional deployment rather than charging artisans for basic access.

Prototype Evaluation Metrics

The prototype can be evaluated using measurable indicators such as:

Productization completion rate
Interview completion rate
Average number of questions required
Product information completeness before and after interview
Market-pack generation success rate
Pre-Rejection issues detected and fixed
Pricing explanation visibility
End-to-end processing time
Failure recovery rate
User correction rate

Performance percentages should be measured through prototype testing rather than assumed.

Local Development
Prerequisites

Install:

Node.js
MongoDB
Git

You will also need an OpenRouter API key.

Clone the Repository
git clone https://github.com/itsmierrrrr/pae.git
cd pae
Install Dependencies
npm install
Environment Variables

Create a .env file in the project root.

PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=your_model

CLIENT_URL=http://localhost:5173

For the frontend:

VITE_API_BASE_URL=http://localhost:5000/api

Never expose the following variables through frontend environment variables:

OPENROUTER_API_KEY
JWT_SECRET
MONGO_URI
Run the Application
npm run dev

Frontend:

http://localhost:5173

Backend:

http://localhost:5000
Production Deployment
Frontend

The frontend can be deployed using Vercel.

Required environment variable:

VITE_API_BASE_URL=https://your-render-backend.onrender.com/api
Backend

The backend can be deployed using Render.

Required environment variables:

NODE_ENV=production

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=your_model

CLIENT_URL=https://your-vercel-frontend.vercel.app

The frontend and backend should use separate environment variables so private backend credentials are never bundled into the client application.

Testing Strategy

Pए can be tested at multiple levels:

Unit Tests
    |
    v
API Tests
    |
    v
Integration Tests
    |
    v
UI Tests
    |
    v
End-to-End Tests
    |
    v
SIH Demo Regression

Important areas include:

Product validation
Product field extraction
Pricing calculations
Interview state transitions
API authentication
AI provider integration
Market-pack generation
Pre-Rejection rules
Error recovery
Complete artisan journey

A fixed demo product should be used during SIH demonstrations so external AI provider variability does not determine whether the demonstration succeeds.

Example User Journey

Consider an artisan who creates a handmade wool keychain.

The artisan starts by uploading a product image and providing a short description.

Pए then:

1. Analyzes the product
2. Creates a structured product draft
3. Identifies missing information
4. Starts a targeted voice interview
5. Collects the missing information
6. Updates the Product Passport
7. Allows the artisan to review the information
8. Provides an explainable pricing range
9. Generates market-specific product packs
10. Checks the selected pack using the Pre-Rejection Simulator
11. Displays relevant opportunity cards

The artisan does not need to understand the underlying digital commerce workflow.

Design Principles
Artisan First

The technology should adapt to the artisan rather than requiring the artisan to understand complicated commerce systems.

Explainable AI

AI-generated information should be reviewable and correctable.

Confirmed facts should remain separate from recommendations and inferred information.

Canonical Product Data

The Product Passport acts as the single structured representation from which downstream features operate.

Deterministic Validation

AI is used for interpretation and generation.

Deterministic code handles:

Required fields
Validation
Consistency
Readiness checks
Pricing calculations where appropriate
Reliability Over Feature Count

A smaller workflow that works reliably is more valuable than a larger workflow containing broken or simulated functionality.

Future Scope

Possible future extensions include:

Deeper marketplace integrations
Live opportunity discovery
Additional Indian regional languages
Artisan organization dashboards
Additional market and channel adapters
Production-grade media storage
Advanced validation rules
Broader institutional deployments
Direct integration with relevant commerce ecosystems

These features are outside the core SIH prototype scope.

SIH 2026
Project

Pए — From Craft to Market

Vision

Enable artisans to move from physical craft to digital commerce without requiring them to understand complex digital commerce workflows.

Core MVP
AI Productization
        +
Voice Product Interview
        +
Adaptive Market Pack
Additional Capabilities
Explainable Pricing
        +
Pre-Rejection Simulator
        +
Product Passport and Verification
        +
Market Linkage and Opportunities
Core Innovation

Pए combines AI-assisted productization, targeted voice-based information collection, and market-specific product adaptation into a single artisan-focused workflow.

Project Status

SIH 2026 Prototype

The current version is a functional prototype focused on demonstrating the complete artisan journey from product capture to a structured, verified, priced, and market-ready digital product.

Repository Structure
pae/
|
+-- backend/
+-- server/
|   +-- config/
|   +-- controllers/
|   +-- middleware/
|   +-- models/
|   +-- routes/
|   +-- services/
|   +-- utils/
|   +-- uploads/
|   +-- app.js
|   +-- server.js
|
+-- public/
+-- src/
|   +-- components/
|   +-- pages/
|   +-- services/
|   +-- hooks/
|   +-- assets/
|
+-- dist/
+-- package.json
+-- vite.config.js
+-- .env
+-- README.md
Contributing

Contributions should preserve the core product principles:

Keep the artisan workflow simple.
Do not introduce unsupported claims.
Keep AI-generated facts separate from confirmed facts.
Validate AI output before persistence.
Prefer reliable functionality over unnecessary features.
Keep secrets and provider credentials on the backend.
Avoid expanding the prototype into a marketplace clone.
License

This project is developed as a Smart India Hackathon 2026 prototype.

License and usage terms can be added when the project license is finalized.

Team

Developed for Smart India Hackathon 2026.

Pए — From Craft to Market

Turning craft capability into digital commerce capability.
