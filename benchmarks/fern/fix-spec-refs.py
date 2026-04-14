#!/usr/bin/env python3
"""Strip dangling $ref entries from an OpenAPI/Swagger spec.

Historical Square API specs contain $ref pointers to schemas that are
referenced but never defined (e.g. CardRefundDetails, ExternalPower).
This script removes those dangling references so the spec can be
processed by Fern without errors.

Usage: python3 fix-spec-refs.py <spec.json> [--in-place]
  Without --in-place, prints the fixed JSON to stdout.
  With --in-place, overwrites the input file.
"""
import json
import sys


def collect_defined_schemas(spec):
    """Return the set of schema names defined in the spec."""
    # OAS 3.x: components.schemas
    schemas = spec.get("components", {}).get("schemas", {})
    if schemas:
        return set(schemas.keys()), "#/components/schemas/"
    # Swagger 2.0: definitions
    definitions = spec.get("definitions", {})
    if definitions:
        return set(definitions.keys()), "#/definitions/"
    return set(), ""


def strip_dangling_refs(obj, defined, prefix):
    """Recursively walk the spec and replace dangling $ref objects with
    an empty object so the surrounding structure stays valid."""
    if isinstance(obj, dict):
        if "$ref" in obj:
            ref = obj["$ref"]
            if ref.startswith(prefix):
                name = ref[len(prefix):]
                if name not in defined:
                    # Replace the dangling ref with a permissive empty schema
                    return {"type": "object", "description": f"[stripped dangling ref: {name}]"}
            return obj
        return {k: strip_dangling_refs(v, defined, prefix) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [strip_dangling_refs(item, defined, prefix) for item in obj]
    return obj


def main():
    in_place = "--in-place" in sys.argv
    args = [a for a in sys.argv[1:] if a != "--in-place"]

    if not args:
        print("Usage: python3 fix-spec-refs.py <spec.json> [--in-place]", file=sys.stderr)
        sys.exit(1)

    path = args[0]
    with open(path, "r", encoding="utf-8") as f:
        spec = json.load(f)

    defined, prefix = collect_defined_schemas(spec)
    if not prefix:
        # No schemas section found — nothing to fix
        if in_place:
            pass  # file unchanged
        else:
            json.dump(spec, sys.stdout, indent=2, ensure_ascii=False)
        return

    fixed = strip_dangling_refs(spec, defined, prefix)

    # Count how many refs were stripped
    original_json = json.dumps(spec)
    fixed_json = json.dumps(fixed, indent=2, ensure_ascii=False)
    stripped = fixed_json.count("[stripped dangling ref:")
    if stripped > 0:
        print(f"Stripped {stripped} dangling $ref entries from {path}", file=sys.stderr)

    if in_place:
        with open(path, "w", encoding="utf-8") as f:
            f.write(fixed_json)
            f.write("\n")
    else:
        print(fixed_json)


if __name__ == "__main__":
    main()
