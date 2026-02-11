#!/bin/bash
# Sync .claude/rules/*.md → all AI coding tools.
# Source of truth: .claude/rules/*.md + CLAUDE.md
# Run after editing any rule file: bash scripts/sync-rules.sh

set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RULES_DIR="$ROOT/.claude/rules"

echo "Syncing rules from $RULES_DIR..."

# --- Helper: concatenate all rule files ---
concat_rules() {
  echo "# Code Rules — $(basename "$ROOT")"
  echo "# Auto-generated from .claude/rules/*.md — do NOT edit directly."
  echo "# Edit files in .claude/rules/ and run: bash scripts/sync-rules.sh"
  echo ""
  for f in "$RULES_DIR"/*.md; do
    cat "$f"
    echo ""
    echo "---"
    echo ""
  done
}

# --- 1. Cursor — directory of symlinks ---
mkdir -p "$ROOT/.cursor/rules"
for f in "$RULES_DIR"/*.md; do
  base=$(basename "$f")
  ln -sf "../../.claude/rules/$base" "$ROOT/.cursor/rules/$base"
done
echo "  ✓ .cursor/rules/ (symlinks)"

# --- 2. Augment Code (new) — directory of symlinks ---
mkdir -p "$ROOT/.augment/rules"
for f in "$RULES_DIR"/*.md; do
  base=$(basename "$f")
  ln -sf "../../.claude/rules/$base" "$ROOT/.augment/rules/$base"
done
echo "  ✓ .augment/rules/ (symlinks)"

# --- 3. Augment Code (legacy) — single concatenated file ---
concat_rules > "$ROOT/.augment-guidelines"
echo "  ✓ .augment-guidelines (concatenated)"

# --- 4. GitHub Copilot — single concatenated file ---
mkdir -p "$ROOT/.github"
concat_rules > "$ROOT/.github/copilot-instructions.md"
echo "  ✓ .github/copilot-instructions.md (concatenated)"

# --- 5. Gemini Code Assist (IDE) — single concatenated file ---
mkdir -p "$ROOT/.gemini"
concat_rules > "$ROOT/.gemini/styleguide.md"
echo "  ✓ .gemini/styleguide.md (concatenated)"

# --- 6. OpenAI Codex — symlink to CLAUDE.md ---
ln -sf CLAUDE.md "$ROOT/AGENTS.md"
echo "  ✓ AGENTS.md → CLAUDE.md (symlink)"

# --- 7. Gemini CLI — symlink to CLAUDE.md ---
ln -sf CLAUDE.md "$ROOT/GEMINI.md"
echo "  ✓ GEMINI.md → CLAUDE.md (symlink)"

echo ""
echo "Done. All 7 tools now share the same rules."
