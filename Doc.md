# Vehicle Number Plate Dataset Verification & Annotation Tool
### Complete System Documentation — Implementation-Ready Specification

---

> **Stack:** Next.js · TypeScript  
> **Purpose:** Human-in-the-loop annotation workflow for validating and cleaning large vehicle plate image datasets  
> **Audience:** Engineers responsible for building and maintaining this system

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Dataset Workflow](#2-dataset-workflow)
3. [Annotation Status System](#3-annotation-status-system)
4. [Functional Workflow](#4-functional-workflow)
5. [System Architecture](#5-system-architecture)
6. [User Interface Design](#6-user-interface-design)
7. [Dataset Export System](#7-dataset-export-system)
8. [Performance Considerations](#8-performance-considerations)
9. [Error Handling](#9-error-handling)
10. [Future Extensions](#10-future-extensions)

---

## 1. System Overview

The system is a **web-based dataset verification and annotation tool** purpose-built for validating vehicle license plate images at scale. It is designed to support data cleaning pipelines where human reviewers must verify, correct, and classify thousands of plate images before the dataset is used for training or evaluation.

### Core Verification Task

The fundamental task the system performs is a **filename-to-plate-text comparison**:

- Each image in the dataset has a filename that is expected to match the text visible on the license plate inside that image.
- The reviewer examines each image, reads the plate text, and determines whether the filename is correct.
- If the filename is wrong, the reviewer corrects it during annotation.
- If the plate is unreadable, damaged, or absent, the image is classified accordingly.

**Example of a valid image:**

| Field | Value |
|---|---|
| Image filename | `KIN-2832.jpg` |
| Plate text in image | `KIN-2832` |
| Result | ✅ Valid — filename matches plate |

**Example of a corrected image:**

| Field | Value |
|---|---|
| Image filename | `ABG-9012.jpg` |
| Plate text in image | `ABC-9012` |
| Result | ✏️ Corrected — filename renamed to `ABC-9012.jpg` |

### Design Philosophy

- The system operates entirely within the browser environment using a **client-side-first architecture**.
- The original dataset folder is **never modified** during the annotation process.
- All annotation decisions are held in application state until the user explicitly triggers an export.
- The tool is optimised for **speed of review**, supporting keyboard-driven workflows for experienced annotators.

---

## 2. Dataset Workflow

### 2.1 Input Dataset

The user provides a single flat folder of raw images. The system does not assume any pre-existing folder structure.

**Example input:**

```
dataset_raw/
├── KIN-2832.jpg
├── ABG-9012.jpg
├── IMG_1123.jpg
└── random_car.jpg
```

Supported image formats:

- `.jpg`
- `.jpeg`
- `.png`
- `.webp`

Files with unsupported extensions are silently excluded from the index and optionally surfaced in a warning panel.

### 2.2 Output Dataset

After annotation is complete, the user triggers an export. The system produces a **structured ZIP archive** containing all processed images organised into classification folders.

**Output structure:**

```
dataset_export.zip
└── dataset/
    ├── valid/
    │   ├── KIN-2832.jpg
    │   └── ABC-9012.jpg
    ├── corrected/
    │   └── XYZ-4441.jpg
    ├── unclear/
    │   ├── IMG_1123.jpg
    │   └── IMG_1130.jpg
    └── rejected/
        └── random_car.jpg
```

Each folder corresponds directly to one of the four annotation status categories described in Section 3.

---

## 3. Annotation Status System

Every image in the dataset must be assigned exactly one of the following four statuses before export. Images that have not yet been reviewed are in a default **Pending** state and are excluded from the export.

---

### 3.1 Valid

**Condition:** The plate is clearly visible, and the filename already correctly matches the plate text.

**No edits are required.** The reviewer approves the image as-is.

**Output directory:** `dataset/valid/`

---

### 3.2 Corrected

**Condition:** The plate is clearly readable, but the current filename does not match the plate text.

The reviewer provides the correct plate text, and the system renames the image file accordingly during export.

**Output directory:** `dataset/corrected/`

> The corrected filename replaces the original. The image binary is preserved exactly.

---

### 3.3 Unclear

**Condition:** A license plate is present in the image, but the text on it cannot be reliably read.

Common reasons include:

- Motion blur
- Low image resolution
- Lens glare or overexposure
- Partial occlusion (dirt, objects, bodywork)
- Extreme viewing angle

These images are retained in the dataset because they may still hold value for certain model training scenarios (e.g., blur detection, plate detection without OCR).

**Output directory:** `dataset/unclear/`

---

### 3.4 Rejected

**Condition:** The image is not suitable for the dataset at all.

Common reasons include:

- No license plate visible in the image
- Image is a random object, scene, or background
- File is corrupted or fails to render
- Image is a duplicate (if deduplication is enabled)

**Output directory:** `dataset/rejected/`

---

### Status Summary Table

| Status | Plate Present | Text Readable | Filename Correct | Export Folder |
|---|---|---|---|---|
| Valid | ✅ Yes | ✅ Yes | ✅ Yes | `valid/` |
| Corrected | ✅ Yes | ✅ Yes | ❌ No (fixed) | `corrected/` |
| Unclear | ✅ Yes | ❌ No | N/A | `unclear/` |
| Rejected | ❌ No | N/A | N/A | `rejected/` |
| Pending | — | — | — | *(not exported)* |

---

## 4. Functional Workflow

### Stage 1 — Dataset Loading

The user opens the application and selects a dataset folder from their local filesystem using the browser's directory picker API.

The system then:

1. Reads all files within the selected folder.
2. Filters files to include only supported image formats.
3. Rejects and logs any unsupported or unreadable files.
4. Builds the dataset index (see Stage 2).
5. Navigates the user to the first unreviewed image.

If the folder is empty or contains no supported images, the system displays an appropriate message and prompts the user to select a different folder.

---

### Stage 2 — Dataset Indexing

Following a successful load, the system creates an **in-memory dataset index**. This index is the source of truth for the entire annotation session.

Each entry in the index contains:

| Field | Description |
|---|---|
| `id` | Unique internal identifier |
| `originalFilename` | The filename as loaded from disk |
| `currentFilename` | The working filename (may differ if renamed) |
| `filePath` | The full path reference for reading the image |
| `format` | Detected image format (jpg, png, webp) |
| `status` | Current annotation status (Pending by default) |
| `correctionHistory` | Array of rename events applied to this image |
| `reviewedAt` | Timestamp of last annotation action |

The system also maintains a **session-level counter** tracking:

- Total images in the dataset
- Number reviewed
- Number remaining
- Count per status category

---

### Stage 3 — Image Review Interface

The main interface presents images one at a time in a **sequential viewer**. The reviewer's task on each image is to:

1. Examine the plate visible in the image.
2. Read the plate text.
3. Compare the plate text to the current filename shown on screen.
4. Take the appropriate action (see Stage 4).

The reviewer should be able to complete this task on most images in under three seconds.

---

### Stage 4 — Annotation Actions

The following actions are available on each image:

#### Approve (Mark as Valid)

Confirms that the filename matches the plate. Assigns `Valid` status and advances to the next image.

#### Rename & Approve (Mark as Corrected)

The reviewer edits the filename field and submits the correction. The system assigns `Corrected` status, records the rename event in the correction history, and advances to the next image.

#### Mark as Unclear

Flags the image as having an unreadable plate. Assigns `Unclear` status and advances.

#### Mark as Rejected

Flags the image as not containing a usable plate. Assigns `Rejected` status and advances.

---

All actions must be available via both **on-screen buttons** and **keyboard shortcuts**.

| Action | Suggested Keyboard Shortcut |
|---|---|
| Approve / Valid | `A` or `Enter` |
| Mark as Unclear | `U` |
| Mark as Rejected | `R` |
| Begin Rename | `E` or `F2` |
| Confirm Rename | `Enter` (while rename field is focused) |
| Cancel Rename | `Escape` |

> Keyboard shortcut bindings must be disabled when the rename input field is focused to prevent accidental status assignment while typing.

---

### Stage 5 — Navigation

The reviewer can move through the dataset using the following navigation methods:

| Method | Description |
|---|---|
| Next Image | Advance to the next image in the index |
| Previous Image | Go back to the previous image |
| Jump to Index | Enter a specific image number to jump directly to it |
| Skip Image | Move forward without assigning a status (remains Pending) |
| Filter Navigation | Navigate only within a specific status category (e.g., review only Pending images) |

Navigation actions must also be bound to keyboard shortcuts:

| Action | Suggested Keyboard Shortcut |
|---|---|
| Next Image | `→` Arrow Right or `D` |
| Previous Image | `←` Arrow Left or `A` (when rename is not active) |
| Jump to Index | `G` (opens a jump dialog) |

---

### Stage 6 — Progress Tracking

The interface continuously displays dataset-level progress. This panel should update in real time as annotations are saved.

**Example progress state:**

```
Total Images:    5,000
Reviewed:        3,200   (64%)
Remaining:       1,800

  ✅ Valid:        2,800
  ✏️ Corrected:     200
  ❓ Unclear:       120
  ❌ Rejected:       80
```

A visual progress bar should reflect the ratio of reviewed to total images.

---

### Stage 7 — Export

When annotation is complete (or at any intermediate point), the reviewer triggers the export. See Section 7 for the full export system specification.

---

## 5. System Architecture

### 5.1 Architectural Principles

- **Client-side first:** All image reading, indexing, annotation state, and export packaging occur entirely in the browser. No backend server is required for core functionality.
- **Stateless sessions:** Each session begins fresh. Optionally, session state may be persisted to `localStorage` or exported as a JSON session file to allow resumption.
- **Modular layer separation:** UI components, business logic, and data management are separated into distinct layers to facilitate future extension.

---

### 5.2 Layer Overview

```
┌────────────────────────────────────────────────────┐
│                   UI Layer                         │
│   Next.js Pages · React Components · Tailwind CSS  │
├────────────────────────────────────────────────────┤
│                Application Layer                   │
│   Annotation Engine · Navigation Controller        │
│   Progress Tracker · Keyboard Handler              │
├────────────────────────────────────────────────────┤
│                 Data Layer                         │
│   Dataset Index · Session Store · Correction Log   │
├────────────────────────────────────────────────────┤
│                 Export Layer                       │
│   ZIP Builder · File Organiser · Rename Processor  │
├────────────────────────────────────────────────────┤
│              Browser File System API               │
│   File System Access API · Blob API · URL.create   │
└────────────────────────────────────────────────────┘
```

---

### 5.3 Key Modules

#### Dataset Loader Module

Responsible for reading the user-selected directory, filtering supported files, and constructing the initial dataset index. Interfaces directly with the browser's File System Access API.

#### Dataset Index Store

The central in-memory data store for the session. Holds all image metadata, current annotation statuses, and correction histories. Implemented as a typed state store (e.g., Zustand or React Context with useReducer).

#### Annotation Engine

Processes annotation actions (approve, rename, unclear, reject) and applies them to the dataset index. Validates rename inputs before committing. Manages status transitions.

#### Navigation Controller

Manages the current image pointer within the dataset index. Handles sequential navigation, jump-to-index, and filter-based navigation. Exposes methods consumed by both UI controls and the keyboard handler.

#### Keyboard Handler

A global keyboard event listener that maps key presses to annotation and navigation actions. Maintains awareness of UI focus state to prevent conflicts with text input fields.

#### Progress Tracker

A derived view over the dataset index that computes session-level statistics. Updates reactively whenever the index changes.

#### Export Engine

Reads the final state of the dataset index, groups images by status, applies corrected filenames, fetches image binary data, and produces a ZIP archive using a client-side ZIP library (e.g., JSZip or fflate).

---

### 5.4 Data Flow

```
User selects folder
        │
        ▼
Dataset Loader reads files
        │
        ▼
Dataset Index populated (all images → Pending)
        │
        ▼
Navigation Controller sets pointer to image[0]
        │
        ▼
Viewer renders current image + metadata
        │
        ▼
User performs annotation action
        │
        ▼
Annotation Engine updates index entry (status, filename)
        │
        ▼
Navigation Controller advances pointer
        │
        ▼
Progress Tracker updates counters
        │
        ▼
[Loop until dataset complete]
        │
        ▼
User triggers Export
        │
        ▼
Export Engine builds ZIP → browser download
```

---

### 5.5 State Shape

The core application state is organised around the following structure:

**Session State**

- Active dataset reference
- Total image count
- Current image pointer (index)
- Filter mode (All / Pending / specific status)

**Dataset Index** *(array of image records)*

Each record contains:
- Unique ID
- Original filename
- Current (working) filename
- File reference (for reading binary)
- Annotation status
- Timestamps
- Correction history entries

**Correction History Entry**

- Timestamp
- Previous filename
- New filename

---

## 6. User Interface Design

The UI must be clean, dark-friendly, and optimised for extended annotation sessions. Cognitive load should be minimised — the reviewer's focus is on the image, not the interface.

---

### 6.1 Layout Overview

```
┌─────────────────────────────────────────────────┐
│                 Top Navigation Bar              │
├──────────────┬──────────────────┬───────────────┤
│              │                  │               │
│   Progress   │   Image Viewer   │  File Info &  │
│   Panel      │   (main area)    │  Controls     │
│              │                  │               │
├──────────────┴──────────────────┴───────────────┤
│              Navigation Controls                │
└─────────────────────────────────────────────────┘
```

---

### 6.2 Top Navigation Bar

The bar spans the full width of the viewport and remains fixed at the top.

**Contains:**

- Application name / logo (left)
- Active dataset name (centre-left)
- Compact progress indicator: `Reviewed: 3,200 / 5,000` (centre)
- Export Dataset button (right, primary CTA)
- Session options menu: save session, load session, keyboard shortcuts reference (right)

---

### 6.3 Main Image Viewer

The dominant region of the layout. Displays the current image at the largest practical size.

**Requirements:**

- Image scales responsively to fill available space while preserving aspect ratio.
- Image is displayed at high clarity — no unnecessary compression or downscaling.
- Background behind the image should be neutral (dark grey or near-black) to avoid colour interference when reading plates.
- A loading skeleton or spinner is shown while the image is loading.
- If the image fails to render, an error state placeholder is shown with the filename and error type.

---

### 6.4 File Information Panel

A side panel (right side, or below image on narrow viewports) displaying metadata for the current image.

**Contains:**

| Element | Description |
|---|---|
| Image index indicator | e.g., `Image 3,201 of 5,000` |
| Original filename | Read-only display of the filename as loaded |
| Current filename | Editable rename field (activated via Rename action) |
| File format badge | e.g., `JPG`, `PNG` |
| Current status badge | Colour-coded: Pending / Valid / Corrected / Unclear / Rejected |
| Correction history | Collapsed list of previous rename events for this image |

The rename field should only become editable when the user explicitly activates the rename action. When not in edit mode, the field appears as static text to prevent accidental edits.

---

### 6.5 Annotation Controls

A clearly visible control group, positioned consistently on the screen.

| Button | Colour Suggestion | Keyboard Shortcut |
|---|---|---|
| ✅ Approve (Valid) | Green | `A` or `Enter` |
| ✏️ Rename & Approve | Blue | `E` or `F2` |
| ❓ Mark as Unclear | Amber / Yellow | `U` |
| ❌ Reject | Red | `R` |

Buttons should render with strong visual contrast and large click/tap targets. The currently hovered or focused button should have a clear focus ring.

A **keyboard shortcut legend** should be persistently visible (small, unobtrusive) or accessible via a single key press (e.g., `?`).

---

### 6.6 Navigation Controls

Positioned below or alongside the image viewer.

**Elements:**

- Previous button (`←`)
- Next button (`→`)
- Current position indicator: `3201 / 5000`
- Jump-to-image input: a small numeric field + Go button
- Skip button: advances without annotating

---

### 6.7 Progress Panel

A sidebar or collapsible panel showing session-level statistics.

**Contains:**

- Progress bar (reviewed vs. total)
- Numeric breakdown by status category
- Estimated completion (optional, based on average annotation speed)

---

### 6.8 Responsive Behaviour

- On desktop (≥1280px): three-column layout — progress panel, image viewer, file info panel.
- On tablet (≥768px): two-column — image viewer with stacked panels.
- On mobile: single-column, stacked vertically. (Mobile is a secondary use case; primary target is desktop.)

---

## 7. Dataset Export System

### 7.1 Export Trigger

The export is initiated by the user clicking the **Export Dataset** button in the top navigation bar. The system may optionally prompt the user to confirm if any images remain in Pending status.

---

### 7.2 Pre-Export Validation

Before building the export, the system validates the dataset index:

- Checks for duplicate corrected filenames within the same output folder.
- Checks that all rename values are non-empty and match expected plate format patterns (optional validation).
- Warns if a significant number of images remain unreviewed.

Validation errors are displayed in a blocking modal. Warnings are displayed non-blockingly and allow the user to proceed.

---

### 7.3 Export Process

The export engine performs the following steps in sequence:

**Step 1 — Group images by status**

The dataset index is partitioned into four groups: Valid, Corrected, Unclear, Rejected. Pending images are excluded.

**Step 2 — Resolve filenames**

For each image:
- If status is Valid: use the original filename.
- If status is Corrected: use the current (corrected) filename.
- If status is Unclear or Rejected: use the original filename.

**Step 3 — Fetch image binary data**

For each image in the export set, read the binary data from the file reference held in the dataset index.

**Step 4 — Build ZIP structure**

Using a client-side ZIP library, create the following folder structure in memory:

```
dataset/
├── valid/
├── corrected/
├── unclear/
└── rejected/
```

Place each image binary into its corresponding folder using the resolved filename.

**Step 5 — Generate downloadable archive**

Finalise the ZIP and trigger a browser download with the filename `dataset_export.zip`.

---

### 7.4 Optional Export Metadata

The export may optionally include a `metadata.json` file at the root of the ZIP containing:

- Export timestamp
- Total image counts per category
- List of all corrections applied (original filename → corrected filename)
- Session duration
- Tool version

This metadata file is useful for audit trails and downstream pipeline logging.

---

### 7.5 Export Output Reference

```
dataset_export.zip
└── dataset/
    ├── valid/          ← Filename-verified images, no changes
    ├── corrected/      ← Filename-corrected images (renamed)
    ├── unclear/        ← Unreadable plate images
    ├── rejected/       ← No plate or unusable images
    └── metadata.json   ← (optional) Session audit log
```

---

## 8. Performance Considerations

Processing thousands of images in a browser environment requires deliberate performance engineering. The following strategies must be implemented.

---

### 8.1 Lazy Image Loading

Images are not loaded into memory all at once. The system loads only the **current image** and optionally pre-loads a small buffer of adjacent images.

The dataset index holds only lightweight metadata (filenames, statuses, file references). Image binary data is read on demand.

---

### 8.2 Preloading Adjacent Images

To achieve smooth, near-instant transitions between images, the system preloads the **next 2–3 images** in the background while the user reviews the current one.

Preloaded images are stored as Object URLs in a bounded cache. When the user advances, the next image is already in memory.

---

### 8.3 Image Cache Management

The preload cache is bounded to prevent memory exhaustion. A fixed-size ring buffer (e.g., 5–10 slots) is maintained:

- When a new image is preloaded and the cache is full, the oldest entry is evicted.
- Object URLs of evicted entries are revoked using `URL.revokeObjectURL()` to release memory.

---

### 8.4 Virtualised Index

The dataset index itself is a plain array and is not virtualised. However, any UI list components that render the full index (e.g., a thumbnail strip or status filter panel) must use **virtual scrolling** to avoid rendering thousands of DOM nodes simultaneously.

---

### 8.5 State Update Batching

Annotation actions update a single record in the dataset index. Updates must be handled as targeted, minimal mutations — not full array replacements — to prevent unnecessary re-renders across the UI.

---

### 8.6 Export Performance

For very large datasets (5,000+ images), the ZIP build process may be time-consuming. The following mitigations apply:

- The export is performed asynchronously, with a visible progress indicator.
- A progress percentage is displayed: `Packaging: 2,340 / 5,000 images`.
- The UI remains interactive during export.
- If the browser supports Web Workers, the ZIP build should be offloaded to a worker thread to avoid blocking the main thread.

---

## 9. Error Handling

The system must handle all foreseeable failure modes gracefully. No error should cause a silent crash or data loss.

---

### 9.1 Error Categories

| Error Type | Handling Strategy |
|---|---|
| Unsupported file format | Exclude from index, log in warning panel |
| Corrupted image file | Show error placeholder in viewer, allow user to Reject |
| Failed image load | Display error state in viewer with filename, offer retry |
| Duplicate corrected filename | Block export with validation message, highlight conflicts |
| Rename field empty | Prevent confirmation, show inline validation message |
| Rename conflict with existing valid file | Warn user, require explicit confirmation to override |
| Export ZIP build failure | Display error modal with reason, preserve session state |
| Folder read permission denied | Display permission error with guidance to re-select |
| No supported images found | Display empty state with guidance |

---

### 9.2 Data Integrity Guarantees

- The original dataset folder is **never written to** at any point during the session.
- Annotation state is held entirely in memory (and optionally in localStorage) — disk state is only modified during explicit export.
- If the export process fails partway through, the partially built ZIP is discarded and the user is informed. The session state remains intact and export may be retried.

---

### 9.3 User Feedback Standards

All errors must be communicated to the user using one of the following patterns:

- **Inline validation:** For form field errors (empty rename, invalid characters).
- **Toast notification:** For non-blocking warnings (e.g., image load slow, skipped files).
- **Modal dialog:** For blocking errors that require user acknowledgement before proceeding (e.g., export conflict, permission denied).
- **Error placeholder:** For images that fail to render — shown directly in the image viewer area.

---

## 10. Future Extensions

The architecture is designed to accommodate the following planned and potential future capabilities. These are not in scope for the initial implementation but must not be architecturally blocked by decisions made now.

---

### 10.1 Automatic OCR-Based Plate Detection

An OCR module can be integrated to automatically read plate text from images and pre-populate the filename suggestion field. This reduces reviewer effort on clear, high-quality images.

**Architecture consideration:** The OCR module should be a pluggable service — either a local WebAssembly model or a remote API endpoint. The annotation engine should remain agnostic to how the filename suggestion is generated.

---

### 10.2 AI-Assisted Filename Suggestions

A plate recognition model (beyond basic OCR) may provide confidence-scored filename suggestions. The UI can display these suggestions with a confidence indicator, allowing the reviewer to accept or override with a single keystroke.

---

### 10.3 Batch Approval System

A mode in which the system pre-flags images it considers high-confidence matches (filename matches OCR output with high confidence) for batch approval. The reviewer can approve entire batches with a single confirmation, only manually reviewing edge cases.

---

### 10.4 Dataset Statistics Dashboard

A dedicated analytics view presenting:

- Annotation velocity over time (images per hour)
- Status distribution charts
- Most common correction patterns
- Session history log

---

### 10.5 Export Metadata & Manifest

An enhanced export format that includes a structured JSON manifest alongside the images, containing full correction histories, reviewer identifiers, timestamps, and quality flags. This enables downstream traceability and reproducibility.

---

### 10.6 Session Persistence & Resumption

A mechanism to save the full session state (dataset index + all annotations) to a file, allowing reviewers to pause and resume large annotation jobs across multiple browser sessions without losing progress.

---

### 10.7 Multi-Reviewer Support

A server-backed extension allowing multiple reviewers to work on the same dataset concurrently, with conflict resolution and audit logging per reviewer.

---

*End of Documentation*

---

> **Document Version:** 1.0  
> **Last Updated:** 2026  
> **Implementation Stack:** Next.js · TypeScript · Browser File System Access API · JSZip / fflate