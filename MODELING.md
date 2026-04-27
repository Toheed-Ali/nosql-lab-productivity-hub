# Schema Design — Personal Productivity Hub

> Fill in every section below. Keep answers concise.

---

## 1. Collections Overview

Briefly describe each collection (1–2 sentences each):

- **users** — Stores user account information, credentials (hashed), and profile details.
- **projects** — High-level containers for organizing tasks and notes, allowing users to categorize their work.
- **tasks** — Actionable items belonging to a project, containing embedded subtasks and tags for fine-grained tracking.
- **notes** — Text-based entries for capturing thoughts or documentation, which can optionally be linked to a project.

---

## 2. Document Shapes

For each collection, write the document shape (field name + type + required/optional):

### users
```
{
  _id: ObjectId,
  email: string (required, unique),
  passwordHash: string (required),
  name: string (required),
  createdAt: Date (required)
}
```

### projects
```
{
  _id: ObjectId,
  ownerId: ObjectId (required, reference to users),
  name: string (required),
  description: string (optional),
  archived: boolean (required, default false),
  createdAt: Date (required)
}
```

### tasks
```
{
  _id: ObjectId,
  ownerId: ObjectId (required, reference to users),
  projectId: ObjectId (required, reference to projects),
  title: string (required),
  status: string (required, "todo" | "in-progress" | "done"),
  priority: number (optional, default 1),
  tags: string[] (optional, default []),
  subtasks: Array (optional, default []) [
    { title: string, done: boolean }
  ],
  createdAt: Date (required)
}
```

### notes
```
{
  _id: ObjectId,
  ownerId: ObjectId (required, reference to users),
  projectId: ObjectId (optional, reference to projects),
  content: string (required),
  tags: string[] (optional, default []),
  createdAt: Date (required)
}
```

---

## 3. Embed vs Reference — Decisions

For each relationship, state whether you embedded or referenced, and **why** (one sentence):

| Relationship                       | Embed or Reference? | Why? |
|-----------------------------------|---------------------|------|
| Subtasks inside a task            | Embed               | Subtasks are small, tightly coupled to the parent task, and usually retrieved together. |
| Tags on a task                    | Embed               | Tags are simple strings and part of the task's metadata, making embedding highly efficient for searching. |
| Project → Task ownership          | Reference           | Tasks can grow significantly in number, and referencing avoids hitting the 16MB document limit in projects. |
| Note → optional Project link      | Reference           | Notes are independent entities that only optionally relate to a project, making a reference more flexible. |

---

## 4. Schema Flexibility Example

Name one field that exists on **some** documents but not **all** in the same collection. Explain why this is acceptable (or even useful) in MongoDB.

In the **tasks** collection, the `dueDate` field might exist only for tasks with a specific deadline. This is acceptable in MongoDB because of its **schemaless** nature, allowing us to avoid storing `null` values for tasks without deadlines, which saves space and simplifies the data model for sparse attributes.
