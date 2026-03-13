---
name: plate-match-manager
description: Manage the PlateMatch vehicle plate annotation project. Use for tracking tasks, enforcing the project constitution, and generating project-specific components.
---

# PlateMatch Manager

## Core Workflows

### Task Management
Use this skill to mark tasks as completed in the `specs/` directory and update the central `README.md`.
- **Command**: `Mark task [T###] as complete.`
- **Action**: Update the corresponding `phase-X/task.md` and the central `specs/README.md`.

### Component Generation
Generate Next.js components that adhere to the project's Tailwind and TypeScript standards.
- **Command**: `Create component [Name] for [Phase].`
- **Reference**: See [coding_standards.md](references/coding_standards.md).

### Progress Reporting
Get a summary of the project's status across all phases.
- **Command**: `Show project progress.`
- **Reference**: See [project_structure.md](references/project_structure.md).

## Project Constitution
All actions MUST align with [CONSTITUTION.md](../../../CONSTITUTION.md):
- Read specs fully before implementation.
- Mark tasks immediately upon completion.
- No direct modification of raw dataset folders.
- Prioritize human-in-the-loop efficiency (shortcuts/speed).
