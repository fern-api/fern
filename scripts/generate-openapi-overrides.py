#!/usr/bin/env python3
"""Generate x-fern-sdk-group-name and x-fern-sdk-method-name overrides
from a seed OpenAPI spec, using the Fern definition directory structure
to determine the nested package hierarchy."""

import sys
import os
import yaml


def to_camel(name: str) -> str:
    """Convert kebab-case to camelCase: 'content-type' -> 'contentType'."""
    parts = name.split("-")
    return parts[0] + "".join(p.capitalize() for p in parts[1:])


def build_package_map(definition_dir: str) -> dict[str, list[str]]:
    """Build a map from CamelCase tag to nested group path.

    Scans the Fern definition directory:
      definition/endpoints/container.yml -> EndpointsContainer -> [endpoints, container]
      definition/inlined-requests.yml   -> InlinedRequests     -> [inlinedRequests]
    """
    pkg_map: dict[str, list[str]] = {}

    def scan_dir(dir_path: str, prefix_parts: list[str]):
        try:
            entries = sorted(os.listdir(dir_path))
        except OSError:
            return
        for entry in entries:
            full = os.path.join(dir_path, entry)
            if os.path.isdir(full):
                scan_dir(full, prefix_parts + [to_camel(entry)])
            elif entry.endswith(".yml") and entry != "api.yml":
                name = entry[:-4]
                parts = prefix_parts + [to_camel(name)]
                # Tag is PascalCase join of all parts
                tag = "".join(p[0].upper() + p[1:] for p in parts)
                pkg_map[tag] = parts

    if os.path.isdir(definition_dir):
        scan_dir(definition_dir, [])

    return pkg_map


def generate_overrides(openapi_path: str) -> dict:
    with open(openapi_path) as f:
        spec = yaml.safe_load(f)

    api_dir = os.path.dirname(openapi_path)
    definition_dir = os.path.join(api_dir, "definition")
    pkg_map = build_package_map(definition_dir)

    overrides: dict = {"paths": {}}

    for path, methods in (spec.get("paths") or {}).items():
        for method, operation in methods.items():
            if not isinstance(operation, dict):
                continue

            op_id = operation.get("operationId", "")
            tags = operation.get("tags", [])
            if not op_id or not tags:
                continue

            tag = tags[0]
            if not tag:
                continue

            # Determine group from definition structure, fall back to lowercased tag
            if tag in pkg_map:
                group = pkg_map[tag]
            else:
                group = [tag[0].lower() + tag[1:]]

            # Extract method name by stripping the underscore-joined group prefix
            # operationId format: group1_group2_methodName
            group_prefix = "_".join(group) + "_"
            if op_id.startswith(group_prefix):
                method_name = op_id[len(group_prefix):]
            else:
                method_name = op_id

            if path not in overrides["paths"]:
                overrides["paths"][path] = {}

            overrides["paths"][path][method] = {
                "x-fern-sdk-group-name": group,
                "x-fern-sdk-method-name": method_name,
            }

    return overrides


def main():
    if len(sys.argv) < 2:
        print(f"Usage: {sys.argv[0]} <openapi.yml> [output.yml]", file=sys.stderr)
        sys.exit(1)

    openapi_path = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else None

    overrides = generate_overrides(openapi_path)

    # Avoid YAML anchors/aliases for cleaner output
    noalias = yaml.dumper.Dumper
    noalias.ignore_aliases = lambda self, data: True
    output = yaml.dump(overrides, default_flow_style=False, sort_keys=False, Dumper=noalias)

    if output_path:
        with open(output_path, "w") as f:
            f.write(output)
        print(f"✓ Wrote overrides to {output_path}")
    else:
        print(output)


if __name__ == "__main__":
    main()
