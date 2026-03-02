---
description: Workflow for logging project history before pushing changes
---

# Project History Logging Workflow

This guide must be followed **before every `git push`** to ensure the project history is properly maintained. The history log (`history/HISTORY.md` or `history/history.md`) serves as a critical tracking tool for both the AI agent and the developer.

## Before pushing, you must perform the following steps:

1. **Verify the Project Overview (Top of the File):**
   - Read the beginning of `history/HISTORY.md`.
   - Ensure there is a **correct, concise, and clear description of what is generally inside this project** (its core purpose, main features, and state).
   - If this description is missing or outdated, add or update it at the very top of the file before the chronological log entries.

2. **Log the Recent Changes:**
   - Log the work you have just completed.
   - Group the changes strictly **by date**, exactly as it is currently done in the file.
   - Use a clear header for the date and update title (e.g., `## YYYY-MM-DD — Feature Update`), followed by bulleted lists categorized by components or tasks.

### Structure Example:

```markdown
# Project History Log

**Project Overview:** 
[A brief, clear description of what the project is, its main modules, and its current state.]

---

## YYYY-MM-DD — [Brief title of the update]

### [Component / Activity]
- Detailed point about what was done.
- Another detail.

---
[Previous history entries...]
```

By strictly adhering to this workflow, we ensure that both the human and the AI always have full context of the project's evolution.
