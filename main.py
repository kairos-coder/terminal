from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from kairos_writer import KairosWriter

app = FastAPI(title="Kairos Terminal API")

# -----------------------------
# CORS (IMPORTANT for browser terminal)
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # lock this down later in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

writer = KairosWriter()


# -----------------------------
# REQUEST MODEL
# -----------------------------
class Command(BaseModel):
    raw: str


# -----------------------------
# COMMAND PARSER (v1)
# -----------------------------
def parse(raw: str):
    """
    Simple but structured CLI parser.

    Supported:
    write <type> <content>
    find <type>
    ping
    """

    parts = raw.strip().split()

    if not parts:
        return {"cmd": None}

    cmd = parts[0].lower()

    return {
        "cmd": cmd,
        "args": parts[1:]
    }


# -----------------------------
# EXECUTION ENGINE
# -----------------------------
@app.post("/execute")
def execute(command: Command):

    parsed = parse(command.raw)
    cmd = parsed["cmd"]
    args = parsed["args"]

    # -------------------------
    # PING (health check)
    # -------------------------
    if cmd == "ping":
        return {
            "status": "ok",
            "response": "kairos online"
        }

    # -------------------------
    # WRITE EVENT
    # -------------------------
    if cmd == "write":
        if len(args) < 2:
            return {"error": "Usage: write <type> <content>"}

        type_ = args[0]
        content = " ".join(args[1:])

        result = writer.write(
            type=type_,
            content=content,
            source="terminal"
        )

        return {
            "status": "ok",
            "action": "write",
            "type": type_,
            "content": content,
            "result": "stored"
        }

    # -------------------------
    # FIND EVENTS
    # -------------------------
    if cmd == "find":
        if len(args) < 1:
            return {"error": "Usage: find <type>"}

        type_ = args[0]

        data = writer.client.table("entries") \
            .select("*") \
            .eq("type", type_) \
            .limit(20) \
            .execute()

        return {
            "status": "ok",
            "action": "find",
            "type": type_,
            "data": data.data
        }

    # -------------------------
    # TRACE (basic lineage placeholder)
    # -------------------------
    if cmd == "trace":
        entry_id = args[0] if args else None

        if not entry_id:
            return {"error": "Usage: trace <id>"}

        data = writer.client.table("entries") \
            .select("*") \
            .eq("parent_id", entry_id) \
            .execute()

        return {
            "status": "ok",
            "action": "trace",
            "id": entry_id,
            "children": data.data
        }

    # -------------------------
    # UNKNOWN COMMAND
    # -------------------------
    return {
        "status": "error",
        "error": f"Unknown command: {cmd}"
    }