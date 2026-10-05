"""Detects a SPDX license identifier from the text of a custom LICENSE file."""

from __future__ import annotations

import os
from typing import List, Optional, Tuple

# Mirrors the detection heuristics used by the Java generator (GeneratedBuildGradle).
# Each entry is (required lowercase substrings, SPDX identifier); first match wins.
_LICENSE_PATTERNS: List[Tuple[Tuple[str, ...], str]] = [
    (("apache license", "version 2.0"), "Apache-2.0"),
    (("mit license",), "MIT"),
    (("bsd 3-clause",), "BSD-3-Clause"),
    (("bsd 2-clause",), "BSD-2-Clause"),
    (("gnu general public license", "version 3"), "GPL-3.0-only"),
    (("gnu general public license", "version 2"), "GPL-2.0-only"),
    (("mozilla public license", "2.0"), "MPL-2.0"),
    (("isc license",), "ISC"),
]

DOCKER_LICENSE_PATH = "/tmp/LICENSE"


def detect_spdx_license(content: str) -> Optional[str]:
    lowered = content.lower()
    for needles, spdx_id in _LICENSE_PATTERNS:
        if all(needle in lowered for needle in needles):
            return spdx_id
    return None


def detect_spdx_license_from_file(*candidate_paths: str) -> Optional[str]:
    """Read the first existing path and detect its license; None if unreadable or unrecognized."""
    for path in candidate_paths:
        if os.path.isfile(path):
            try:
                with open(path, "r", encoding="utf-8", errors="replace") as f:
                    return detect_spdx_license(f.read())
            except OSError:
                return None
    return None
