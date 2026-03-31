from __future__ import annotations

import logging
from typing import ClassVar, Set

from fern_python.version.python_version import PythonVersion, get_matching_python_versions

logger = logging.getLogger(__name__)


class GithubCIPythonVersionResolver:
    # https://github.com/actions/python-versions/blob/main/versions-manifest.json
    # The manifest above declares stable versions of Python supported in the setup-python action.
    SUPPORTED_VERSIONS: ClassVar[Set[PythonVersion]] = {
        PythonVersion.PY3_8,
        PythonVersion.PY3_9,
        PythonVersion.PY3_10,
        PythonVersion.PY3_11,
        PythonVersion.PY3_12,
        PythonVersion.PY3_13,
        PythonVersion.PY3_14,
    }

    DEFAULT_VERSION: ClassVar[PythonVersion] = PythonVersion.PY3_9

    @staticmethod
    def resolve(python_version_constraint: str) -> PythonVersion:
        matching_versions = get_matching_python_versions(python_version_constraint)

        ci_compatible_versions = list(GithubCIPythonVersionResolver.SUPPORTED_VERSIONS.intersection(matching_versions))

        if not ci_compatible_versions:
            logger.error(
                f"No CI-supported Python versions satisfy constraint '{python_version_constraint}'. "
                f"Supported versions are: {', '.join(v.spec.to_string() for v in sorted(GithubCIPythonVersionResolver.SUPPORTED_VERSIONS, key=lambda x: x.spec))}. "
                f"Defaulting to {GithubCIPythonVersionResolver.DEFAULT_VERSION.spec.to_string()}."
            )
            return GithubCIPythonVersionResolver.DEFAULT_VERSION

        if GithubCIPythonVersionResolver.DEFAULT_VERSION in ci_compatible_versions:
            return GithubCIPythonVersionResolver.DEFAULT_VERSION

        return min(ci_compatible_versions, key=lambda v: v.spec)
