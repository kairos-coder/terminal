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