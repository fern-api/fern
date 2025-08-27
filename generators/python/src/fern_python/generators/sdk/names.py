import fern.ir.resources as ir_types


def get_username_constructor_parameter_name(basic_auth_scheme: ir_types.BasicAuthScheme) -> str:
    return basic_auth_scheme.username.snake_case.safe_name


def get_username_getter_name(basic_auth_scheme: ir_types.BasicAuthScheme) -> str:
    return f"_get_{basic_auth_scheme.username.snake_case.unsafe_name}"


def get_username_member_name(basic_auth_scheme: ir_types.BasicAuthScheme) -> str:
    return f"_{basic_auth_scheme.username.snake_case.unsafe_name}"


def get_password_constructor_parameter_name(basic_auth_scheme: ir_types.BasicAuthScheme) -> str:
    return basic_auth_scheme.password.snake_case.safe_name


def get_token_constructor_parameter_name(bearer_auth_scheme: ir_types.BearerAuthScheme) -> str:
    return bearer_auth_scheme.token.snake_case.safe_name


def get_token_member_name(bearer_auth_scheme: ir_types.BearerAuthScheme) -> str:
    return f"_{bearer_auth_scheme.token.snake_case.safe_name}"


def get_token_getter_name(bearer_auth_scheme: ir_types.BearerAuthScheme) -> str:
    return f"_get_{bearer_auth_scheme.token.snake_case.safe_name}"


def get_password_getter_name(basic_auth_scheme: ir_types.BasicAuthScheme) -> str:
    return f"_get_{basic_auth_scheme.password.snake_case.unsafe_name}"


def get_password_member_name(basic_auth_scheme: ir_types.BasicAuthScheme) -> str:
    return f"_{basic_auth_scheme.password.snake_case.unsafe_name}"


def get_header_parameter_name(header: ir_types.HttpHeader) -> str:
    return header.name.name.snake_case.safe_name


def get_header_private_member_name(header: ir_types.HttpHeader) -> str:
    return "_" + header.name.name.snake_case.unsafe_name


def get_header_constructor_parameter_name(header: ir_types.HttpHeader) -> str:
    return header.name.name.snake_case.safe_name


def get_auth_scheme_header_constructor_parameter_name(header: ir_types.HeaderAuthScheme) -> str:
    return header.name.name.snake_case.safe_name


def get_auth_scheme_header_private_member_name(header: ir_types.HeaderAuthScheme) -> str:
    return header.name.name.snake_case.safe_name


def get_variable_constructor_parameter_name(variable: ir_types.VariableDeclaration) -> str:
    return variable.name.snake_case.safe_name


def get_variable_member_name(variable: ir_types.VariableDeclaration) -> str:
    return f"_{variable.name.snake_case.safe_name}"


def get_variable_getter_name(variable: ir_types.VariableDeclaration) -> str:
    return f"get_{variable.name.snake_case.safe_name}"
