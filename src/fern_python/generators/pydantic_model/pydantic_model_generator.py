from ...codegen import Filepath, Project
from ...declaration_handler import DeclarationHandlerContext
from ...generated import ir_types
from ...logger import Logger
from .get_directories_for_fern_filepath import get_directories_for_fern_filepath
from .type_declaration_handler import TypeDeclarationHandler


class LoggerImpl(Logger):
    def log(self, content: str) -> None:
        print(content)


class PydanticModelGenerator:
    _intermediate_representation: ir_types.IntermediateRepresentation
    _output_filepath: str
    _logger = LoggerImpl()

    def __init__(self, intermediate_representation: ir_types.IntermediateRepresentation, output_filepath: str):
        self._intermediate_representation = intermediate_representation
        self._output_filepath = output_filepath

    def run(self) -> None:
        with Project(
            filepath=self._output_filepath, project_name=f"{self._intermediate_representation.api_name}"
        ) as project:
            for type_to_generate in self._intermediate_representation.types:
                self._generate_type(project, type=type_to_generate)

    def _generate_type(self, project: Project, type: ir_types.TypeDeclaration) -> None:
        with project.source_file(filepath=self._get_filepath_for_type(type)) as source_file:
            context = DeclarationHandlerContext(source_file=source_file)
            type_declaration_handler = TypeDeclarationHandler(
                declaration=type,
                context=context,
                logger=self._logger,
            )
            type_declaration_handler.run()

    def _get_filepath_for_type(self, type: ir_types.TypeDeclaration) -> Filepath:
        return Filepath(
            directories=get_directories_for_fern_filepath(
                api_name=self._intermediate_representation.api_name,
                fern_filepath=type.name.fern_filepath,
            ),
            file=Filepath.FilepathPart(module_name=type.name.name),
        )
