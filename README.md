# Kairos Terminal

Kairos Terminal is a browser-based command-line interface for interacting with a structured memory database.

It turns a database into a programmable cognitive system.

## Core Concept

Instead of clicking dashboards or writing raw SQL, users interact with their data through commands:

- write
- find
- trace
- tag
- query

Each command operates on a persistent event-based memory system.

## Architecture

Kairos Terminal is composed of:

- HTML Terminal UI (frontend)
- Node.js API Layer (command interpreter)
- Supabase (memory database)
- Optional AI helper layer (classification, summarization, mutation)

## Flow

User → Terminal → Server → Database → Response → Terminal

## Vision

A programmable memory interface for ideas, notes, code, and structured thought.

# Architecture

Kairos Terminal is built as a 4-layer system:

## 1. UI Layer (Terminal)
- HTML-based command interface
- No business logic
- Sends raw commands to backend

## 2. Command Layer (server.js)
- Parses user commands
- Routes actions
- Enforces rules and structure

## 3. Memory Layer (database.js + Supabase)
- Stores all entries as structured events
- Supports querying and lineage tracking

## 4. Intelligence Layer (ai-helper.js)
- Optional system for classification, tagging, summarization
- Future expansion into agent-based reasoning

## Design Principle

All complexity lives in the backend.
The frontend remains minimal and deterministic.