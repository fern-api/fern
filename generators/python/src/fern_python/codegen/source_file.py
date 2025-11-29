from __future__ import annotations

from abc import abstractmethod
from typing import Callable, List, Optional, TypeVar

from . import AST
from .class_parent import ClassParent
from .imports_manager import ImportsManager
from .local_class_reference import LocalClassReference
from .node_writer_impl import NodeWriterImpl
from .reference_resolver_impl import ReferenceResolverImpl
from .top_level_statement import TopLevelStatement
from ordered_set import OrderedSet

from fern_python.codegen.dependency_manager import DependencyManager
from fern_python.codegen.reference_resolver import ReferenceResolver

T_AstNode = TypeVar("T_AstNode", bound=AST.AstNode)


class SourceFile(ClassParent):
    @abstractmethod
    def add_declaration(self, declaration: AST.Declaration, should_export: bool) -> None: ...

    @abstractmethod
    def add_expression(self, expr: AST.Expression) -> None: ...

    @abstractmethod
    def add_arbitrary_code(self, code: AST.CodeWriter) -> None: ...

    @abstractmethod
    def add_footer_expression(self, expression: AST.Expression) -> None: ...

    @abstractmethod
    def to_str(self, include_imports: Optional[bool] = True) -> str: ...

    @abstractmethod
    def write_to_file(self, *, filepath: str) -> None: ...

    @abstractmethod
    def get_imports_manager(self) -> ImportsManager: ...

    @abstractmethod
    def get_reference_resolver(self) -> ReferenceResolver: ...

    @abstractmethod
    def get_dummy_class_declaration(self, declaration: AST.ClassDeclaration) -> LocalClassReference: ...


class SourceFileImpl(SourceFile):
    def __init__(
        self,
        *,
        module_path: AST.ModulePath,
        reference_resolver: ReferenceResolverImpl,
        dependency_manager: DependencyManager,
        completion_listener: Optional[Callable[[SourceFileImpl], None]] = None,
        should_format: bool,
        should_format_as_snippet: bool = False,
        should_include_header: bool = True,
        whitelabel: bool = False,
    ):
        self._module_path = module_path
        self._reference_resolver = reference_resolver
        self._imports_manager = ImportsManager(module_path=module_path)
        self._completion_listener = completion_listener
        self._statements: List[TopLevelStatement] = []
        self._exports: set[str] = set()
        self._footer_statements: List[TopLevelStatement] = []
        self._dependency_manager = dependency_manager
        self._should_format = should_format
        self._should_format_as_snippet = should_format_as_snippet
        self._should_include_header = should_include_header
        self._whitelabel = whitelabel

    def get_imports_manager(self) -> ImportsManager:
        return self._imports_manager

    def get_reference_resolver(self) -> ReferenceResolver:
        return self._reference_resolver

    def add_declaration(
        self,
        declaration: AST.Declaration,
        should_export: bool,
    ) -> None:
        self._statements.append(TopLevelStatement(node=declaration, id=declaration.name))
        if should_export:
            self._exports.add(declaration.name)

    def add_class_declaration(
        self,
        declaration: AST.ClassDeclaration,
        should_export: bool = True,
    ) -> LocalClassReference:
        new_declaration = declaration

        class LocalClassReferenceImpl(LocalClassReference):
            def add_class_declaration(
                class_reference_self,
                declaration: AST.ClassDeclaration,
                should_export: bool = True,
            ) -> LocalClassReference:
                new_declaration.add_class(declaration)
                return LocalClassReferenceImpl(
                    qualified_name_excluding_import=(
                        class_reference_self.qualified_name_excluding_import + (declaration.name,)
                    ),
                    import_=AST.ReferenceImport(
                        module=AST.Module.local(*self._module_path),
                        named_import=new_declaration.name,
                    ),
                )

        self.add_declaration(
            declaration=declaration,
            should_export=should_export if not declaration.name.startswith("_") else False,
        )
        return LocalClassReferenceImpl(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=AST.Module.local(*self._module_path),
                named_import=declaration.name,
            ),
        )

    def get_dummy_class_declaration(
        self,
        declaration: AST.ClassDeclaration,
    ) -> LocalClassReference:
        new_declaration = declaration

        class LocalClassReferenceImpl(LocalClassReference):
            def add_class_declaration(
                class_reference_self,
                declaration: AST.ClassDeclaration,
                should_export: Optional[bool] = None,
            ) -> LocalClassReference:
                return LocalClassReferenceImpl(
                    qualified_name_excluding_import=(
                        class_reference_self.qualified_name_excluding_import + (declaration.name,)
                    ),
                    import_=AST.ReferenceImport(
                        module=AST.Module.local(*self._module_path),
                        named_import=new_declaration.name,
                    ),
                )

        return LocalClassReferenceImpl(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=AST.Module.local(*self._module_path),
                named_import=declaration.name,
            ),
        )

    def add_expression(self, code: AST.Expression) -> None:
        self._statements.append(TopLevelStatement(node=code))

    def add_arbitrary_code(self, code: AST.CodeWriter) -> None:
        self._statements.append(TopLevelStatement(node=code))

    def add_footer_expression(self, expression: AST.Expression) -> None:
        self._footer_statements.append(TopLevelStatement(node=expression))

    def to_str(self, include_imports: Optional[bool] = True) -> str:
        writer = self._prepare_for_writing(include_imports)
        return writer.to_str()

    def write_to_file(self, *, filepath: str) -> None:
        writer = self._prepare_for_writing()
        writer.write_to_file(filepath=filepath)

        if self._completion_listener is not None:
            self._completion_listener(self)

    def _prepare_for_writing(self, include_imports: Optional[bool] = True) -> NodeWriterImpl:
        # metadata about the whole file's AST
        ast_metadata = AST.AstNodeMetadata()

        # generics declarations we need to prepend to the file
        generics_statements: List[TopLevelStatement] = []

        for statement in self._statements + self._footer_statements:
            statement_metadata = statement.get_metadata()
            ast_metadata.update(statement_metadata)

            references_in_statement = OrderedSet(statement_metadata.references)

            # get generics declarations
            generics_declarations = self._get_generics_declarations(statement_metadata.generics)
            for generic_declaration in generics_declarations:
                generics_statements.append(generic_declaration)
                metadata_for_generic_declaration = generic_declaration.get_metadata()
                ast_metadata.update(metadata_for_generic_declaration)
                references_in_statement.update(metadata_for_generic_declaration.references)

            # resolve constraints for imports in this statement
            self._imports_manager.resolve_constraints(
                statement_id=statement.id,
                references=references_in_statement,
            )

        for reference in ast_metadata.references:
            # At times we may be trying to write `if TYPE_CHECKING` imports when no other import brings in typing
            # and so the resolution of the import is off. This is a fine short circuit since it's a built-in module.
            if reference.import_if_type_checking:
                tc_ref = AST.TypeHint.type_checking_reference()
                self._reference_resolver.register_reference(tc_ref)

            # register reference for resolving later
            self._reference_resolver.register_reference(reference)

            # track dependency if this references relies on an external dep
            if include_imports:
                if reference.import_ is not None:
                    for dependency in reference.import_.module.get_dependencies():
                        self._dependency_manager.add_dependency(dependency)

        for declaration in ast_metadata.declarations:
            self._reference_resolver.register_declaration(declaration)

        # add generics declarations to the top of the file
        self._statements = generics_statements + self._statements

        # resolve references
        self._reference_resolver.resolve_references()

        writer = NodeWriterImpl(
            reference_resolver=self._reference_resolver,
            should_format=self._should_format,
            should_format_as_snippet=self._should_format_as_snippet,
            should_include_header=self._should_include_header,
            whitelabel=self._whitelabel,
        )
        self._imports_manager.write_top_imports_for_file(writer=writer, reference_resolver=self._reference_resolver)
        for statement in self._statements:
            if include_imports:
                self._imports_manager.write_top_imports_for_statement(
                    statement_id=statement.id,
                    writer=writer,
                    reference_resolver=self._reference_resolver,
                )
            writer.write_node(statement.node)
        if include_imports:
            self._imports_manager.write_remaining_imports(
                writer=writer,
                reference_resolver=self._reference_resolver,
            )
        for statement in self._footer_statements:
            writer.write_node(node=statement.node)
            writer.write_newline_if_last_line_not()
        return writer

    def get_exports(self) -> set[str]:
        return self._exports

    def _get_all_statements(self) -> List[TopLevelStatement]:
        return self._statements + self._footer_statements

    def _get_generics_declarations(self, generics: OrderedSet[AST.GenericTypeVar]) -> List[TopLevelStatement]:
        return [
            TopLevelStatement(
                id=generic.name,
                node=AST.VariableDeclaration(
                    name=generic.name,
                    initializer=AST.Expression(
                        AST.FunctionInvocation(
                            function_definition=AST.Reference(
                                import_=AST.ReferenceImport(module=AST.Module.built_in(("typing",))),
                                qualified_name_excluding_import=("TypeVar",),
                            ),
                            args=[AST.Expression(f'"{generic.name}"')],
                        ),
                    ),
                ),
            )
            for generic in generics
        ]
