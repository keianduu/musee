#!/usr/bin/env python3
# Audit Muuzee prototype literal font-size values against design-guide.html.
#
# Usage:
#   python3 scripts/audit_design_guide_fonts.py
#   python3 scripts/audit_design_guide_fonts.py --report /tmp/font-audit.md
#   python3 scripts/audit_design_guide_fonts.py --write-baseline
#   python3 scripts/audit_design_guide_fonts.py --check-new
#
# Existing legacy violations can be baselined.
# --check-new fails only when a NEW out-of-guide declaration is introduced.

from pathlib import Path
from collections import Counter, defaultdict
import argparse
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
PROTOTYPE = ROOT / "prototype"
GUIDE = PROTOTYPE / "design-guide.html"
BASELINE = ROOT / "scripts/design_font_baseline.json"

FONT_RE = re.compile(
    r"font-size\s*:\s*([0-9]+(?:\.[0-9]+)?)px",
    re.I
)
TEXT_EXTENSIONS = {".css", ".html", ".js"}

def allowed_sizes():
    guide = GUIDE.read_text(encoding="utf-8")

    token_match = re.search(
        r'<script id="muuzee-design-tokens" type="application/json">\s*(.*?)\s*</script>',
        guide,
        re.S
    )
    if not token_match:
        raise RuntimeError("Design Guide typography tokens not found")

    tokens = json.loads(token_match.group(1))
    typography = tokens.get("typography", {})

    allowed = {
        int(value)
        for value in typography.values()
        if isinstance(value, (int, float))
    }

    for match in re.finditer(
        r"(\d+(?:\.\d+)?)px\s*·\s*page-specific",
        guide
    ):
        allowed.add(int(float(match.group(1))))

    return allowed

def strip_comments_preserve_lines(text, suffix):
    if suffix in {".css", ".js"}:
        text = re.sub(
            r"/\*.*?\*/",
            lambda m: "\n" * m.group(0).count("\n"),
            text,
            flags=re.S
        )

    if suffix == ".html":
        text = re.sub(
            r"<!--.*?-->",
            lambda m: "\n" * m.group(0).count("\n"),
            text,
            flags=re.S
        )

    return text

def scan():
    allowed = allowed_sizes()
    findings = []

    for path in sorted(PROTOTYPE.rglob("*")):
        if not path.is_file() or path.suffix not in TEXT_EXTENSIONS:
            continue

        try:
            raw = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue

        text = strip_comments_preserve_lines(raw, path.suffix)

        for line_no, line in enumerate(text.splitlines(), start=1):
            for match in FONT_RE.finditer(line):
                raw_value = float(match.group(1))
                value = int(raw_value) if raw_value.is_integer() else raw_value

                if value in allowed:
                    continue

                findings.append({
                    "path": path.relative_to(ROOT).as_posix(),
                    "line": line_no,
                    "value": value,
                    "source": " ".join(line.strip().split()),
                })

    return allowed, findings

def counter_for(findings):
    return Counter(
        json.dumps(
            [
                item["path"],
                item["value"],
                item["source"],
            ],
            ensure_ascii=False
        )
        for item in findings
    )

def write_report(path, allowed, findings):
    groups = defaultdict(list)
    for item in findings:
        groups[item["path"]].append(item)

    lines = [
        "# Muuzee Font Size Audit",
        "",
        "Design Guide allowed literal px sizes: "
        + ", ".join(f"{size}px" for size in sorted(allowed)),
        "",
        f"Out-of-guide declarations: **{len(findings)}**",
        "",
    ]

    for file_path in sorted(groups):
        lines.append(f"## `{file_path}`")
        lines.append("")
        for item in groups[file_path]:
            lines.append(
                f"- L{item['line']}: `{item['value']}px` — `{item['source']}`"
            )
        lines.append("")

    Path(path).write_text("\n".join(lines), encoding="utf-8")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--report")
    parser.add_argument("--write-baseline", action="store_true")
    parser.add_argument("--check-new", action="store_true")
    args = parser.parse_args()

    allowed, findings = scan()

    values = Counter(item["value"] for item in findings)

    print(
        "Design Guide allowed:",
        ", ".join(f"{size}px" for size in sorted(allowed))
    )
    print("Out-of-guide declarations:", len(findings))

    if values:
        print(
            "Values:",
            ", ".join(
                f"{value}px × {count}"
                for value, count in sorted(values.items())
            )
        )

    if args.report:
        write_report(args.report, allowed, findings)
        print("Report:", args.report)

    current = counter_for(findings)

    if args.write_baseline:
        BASELINE.write_text(
            json.dumps(
                {
                    "allowed": sorted(allowed),
                    "violations": dict(current),
                },
                ensure_ascii=False,
                indent=2,
                sort_keys=True
            )
            + "\n",
            encoding="utf-8"
        )
        print("Baseline updated:", BASELINE.relative_to(ROOT))

    if args.check_new:
        if not BASELINE.exists():
            print("ERROR: baseline does not exist", file=sys.stderr)
            return 2

        baseline_data = json.loads(BASELINE.read_text(encoding="utf-8"))
        baseline = Counter(baseline_data.get("violations", {}))

        new_items = current - baseline

        if new_items:
            print("ERROR: new Design Guide font-size violations detected:")
            for key, count in new_items.items():
                path, value, source = json.loads(key)
                print(f"  {path}: {value}px × {count} — {source}")
            return 1

        print("OK: no new Design Guide font-size violations")

    return 0

if __name__ == "__main__":
    raise SystemExit(main())
