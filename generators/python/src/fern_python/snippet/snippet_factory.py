class Snippet:
    expressions: List[Expression]

    @property
    def imports():
        # Get imports from expressions
        pass

    def write_snippet():
        pass


# I think this should effectively become the interface that all services
# implement for generating snippets.
# Likely want to right this AFTER writing the tests file.
class SnippetFactory:
    def register_model():
        # Takes in the model, the fields, the types, etc.
        pass

    def register_function():
        # Takes in the function, the parameters, the return type, etc.
        # How to call it as well, e.g. static or not
        pass

    def get_snippet_for_model():
        # Need the model, the data going into the model instantiation
        # Should take in the model ID and the data going into the model
        pass
    
    def get_snippet_for_function_invocation():
        # Need the function (the parameters for the function too) and the data going in for each parameter
        # Should take in the parameters for calling the function and the endpoint ID
        pass
    
    def get_snippet_for_client_instantiation():
        # Need the client function and to basically call get_snippet_for_function_invocation
        # Should take in the parameters for client init
        pass

    def get_imports_for_snippet(snippet: Snippet):
        return snippet.imports
    
    # Helpers - P4
    def generate_reference_md():
        pass

    def generate_docstring():
        pass

    def generate_snippets_json():
        pass