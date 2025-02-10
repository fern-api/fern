import os

from fern_python.codegen.ast.dependency.dependency import DependencyCompatibility
from fern_python.codegen.dependency_manager import DependencyManager


class RequirementsTxt:
    def __init__(self, path: str, dependency_manager: DependencyManager):
        self._path = path
        self._dependency_manager = dependency_manager

    def write(self) -> None:
        dependencies = self._dependency_manager.get_dependencies()

        content = ""
        for dep in sorted(dependencies, key=lambda d: d.name):
            version = dep.version
            if version.startswith((">=", "<=", "==", ">", "<")):
                content += f"{dep.name}{version}\n"
                continue

            if dep.compatibility == DependencyCompatibility.GREATER_THAN_OR_EQUAL:
                version = f">={version}"
            elif dep.compatibility == DependencyCompatibility.EXACT:
                version = f"=={version}"
            else:
                raise ValueError(f"Unsupported dependency compatibility: {dep.compatibility}")
            content += f"{dep.name}{version}\n"

        with open(os.path.join(self._path, "requirements.txt"), "w") as f:
            f.write(content)
