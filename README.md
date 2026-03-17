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

## 🛠️ Discussion and potential new features in future
Instead of allowing autonomous agents to operate without oversight, this workflow enforces a multi-stage validation process for customer-facing content (Emails, Support Tickets, Quotes).

1. Constrained Generation: AI agents are grounded in specific corporate "Brand Voice" documents. The model can fed by real-time product specifications and technical constraints to prevent factual errors. By using Retrieval-Augmented Generation (RAG) combined with strict system prompts, the model is restricted from making unauthorized promises, nventing product capabilities or reducing hallucination.
2. Human-in-the-Loop (HITL) Validation can isolate edge cases. Low-confidence outputs or sensitive inquiries (e.g., refund requests, sensitive data queries) are automatically flagged and routed to a secure human-operator interface. The "Wait for Review" Gate: utilizing n8n's asynchronous webhook nodes, the workflow pauses execution until a human reviews the draft via a interactive interface. Reviewers can approve, reject, or even "edit-to-fix" the AI’s draft, ensuring a high-level compliance before the final payload is dispatched.
3. Data Collection for RLHF Feedback Logging: Every human intervention (edit or rejection) is logged as a "correction pair". This structured data serves as the foundation for Reinforcement Learning from Human Feedback. Over time, these correction pairs are used to fine-tune the model's reward system, training the AI to "prefer" the tone and accuracy favored by human experts.
