from fern_python.codegen import AST

# Version 4.0 is when NotRequired was added, which is the core need for this dependency
TYPING_EXTENSIONS_DEPENDENCY = AST.Dependency(name="typing_extensions", version=">=4.0.0")
