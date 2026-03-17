# 🔮 AI Customer Support HITL Pipeline

An automated, Human-in-the-Loop (HITL) email processing pipeline built with n8n. This workflow leverages Google Gemini to analyze incoming customer emails, draft context-aware responses, and calculate a confidence score. High-risk or low-confidence drafts are routed to a human operator via Telegram for review before being dispatched. These drafts store in database for potential Reinforcement Learning from Human Feedback (RLHF) in the future. This workflow demonstrates how to constrain Large Language Models (LLMs) to ensure output quality, mitigate hallucinations, and maintain professional rigor.

## 🌟 Key Features

*   **Automated Triage & Drafting:** Uses Gemini 2.5 Flash to parse emails and generate replies.
*   **Dynamic Confidence Scoring:** Automatically deducts confidence points based on detected flags (e.g., `refund`, `medical`, `legal_claim`).
*   **Human-in-the-Loop (HITL):** Low-confidence drafts (< 0.75) are paused and sent to a Telegram bot with inline `Approve` / `Reject` buttons.
*   **Data Persistence & RLHF Ready:** Saves all incoming prompts, AI responses, and human decisions into a PostgreSQL database to build a high-quality dataset for future model fine-tuning.

## 🏗️ Architecture & Tech Stack

*   **Orchestration:** [n8n](https://n8n.io/) (Self-hosted on GCP VM)
*   **LLM:** Google Gemini API (Prompt Engineering & JSON structured output)
*   **Database:** PostgreSQL (Storing jobs and operator corrections)
*   **Communication:** Gmail API (Trigger & Send), Telegram Bot API (Operator Alerts)

## 📋 Prerequisites

To run this workflow, you need:
*   An active n8n instance (Self-hosted recommended).
*   A PostgreSQL database.
*   Google Cloud Console project with Gmail API enabled (OAuth2 credentials).
*   Google Gemini API Key.
*   A Telegram Bot Token and your Chat ID.

## 🚀 Setup Instructions

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/robinsonlang22/HITL_workflow.git
    ```
2.  **Import Workflow:**
    *   Open your n8n UI.
    *   Click **Import from File** and select `email_hitl.json`.
3.  **Configure Credentials:**
    *   Connect your Gmail account via OAuth2.
    *   Set up your PostgreSQL connection.
    *   Add your Gemini API key.
    *   Configure the native Telegram node with your Bot Token.
4.  **Set Environment/Global Variables:**
    *   Ensure `$vars.TELEGRAM_CHAT_ID` is set in your n8n Variables panel.
5.  **Database Setup:**
    Run the provided `schema.sql` in your Postgres instance to create the `jobs` and `corrections` tables.

## 🧠 Workflow Logic

1.  **Trigger:** Listens for new emails matching specific criteria.
2.  **AI Processing:** Prompts Gemini to generate a JSON object containing the draft, confidence score, and flags.
3.  **Routing:**
    *   `Confidence >= 0.75`: Auto-replies directly via Gmail.
    *   `Confidence < 0.75`: Halts execution and sends a webhook-backed approval card to Telegram.
4.  **Resolution:** Operator clicks Approve/Reject, workflow resumes, updates the DB, and dispatches the final email.

### 🎯 Objective: Corporate-Aligned AI Communication
Instead of allowing autonomous agents to operate without oversight, this workflow enforces a multi-stage validation process for customer-facing content (Emails, Support Tickets, Quotes).

1. Constrained Generation (The AI Agent)Brand & Persona Alignment: AI agents are grounded in specific corporate "Brand Voice" documents.Product Parameter Ingestion: The model is fed real-time product specifications and technical constraints to prevent factual errors.Hallucination Mitigation: By using Retrieval-Augmented Generation (RAG) combined with strict system prompts, the model is restricted from making unauthorized promises or inventing product capabilities.
2. Human-in-the-Loop (HITL) ValidationIsolation of Edge Cases: Low-confidence outputs or sensitive inquiries (e.g., refund requests, medical data queries) are automatically flagged and routed to a secure human-operator interface.The "Wait for Approval" Gate: Utilizing n8n's asynchronous webhook nodes, the workflow pauses execution until a human reviews the draft via a custom, IAP-protected dashboard.Manual Correction: Operators can approve, reject, or "edit-to-fix" the AI’s draft, ensuring 100% compliance before the final payload is dispatched.
3. Data Collection for RLHFFeedback Logging: Every human intervention (edit or rejection) is logged as a "correction pair."Model Optimization: This structured data serves as the foundation for Reinforcement Learning from Human Feedback. Over time, these correction pairs are used to fine-tune the model's reward system, training the AI to "prefer" the tone and accuracy favored by human experts.

### 🛡️ Business Value: Quality & Robustness
1. Error Prevention: Eliminates the risk of "rogue AI" damaging brand reputation through impolite or inaccurate responses.
2. Operational Scalability: Allows a small team of human experts to oversee thousands of AI-generated messages, only intervening where the AI's confidence score falls below a set threshold.
3. Compliance Ready: Provides a full audit trail of who approved what content and when—a mandatory requirement for medical, legal, and financial sectors.

### 🚀 Implementation PreviewThe upcoming workflow will feature:
1. Sentiment & Tone Analysis: Pre-check nodes to verify professional etiquette.
2. Secure Operator Portal: An IAP-authenticated internal site for human reviewers.
3. Automated Feedback Loop: A PostgreSQL-based logging system to store "Human-Approved" vs "AI-Original" text for future RLHF fine-tuning.
