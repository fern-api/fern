from dataclasses import dataclass


@dataclass
class GeneratedEnvironment:
    module_path: str
    class_name: str
    example_environment: str
