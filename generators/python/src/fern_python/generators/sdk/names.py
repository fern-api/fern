from fern_python.utils import get_name_from_wire_value, resolve_name

import fern.ir.resources as ir_types


def get_username_constructor_parameter_name(basic_auth_scheme: ir_types.BasicAuthScheme) -> str:
    return resolve_name(basic_auth_scheme.username).snake_case.safe_name


def get_username_getter_name(basic_auth_scheme: ir_types.BasicAuthScheme) -> str:
    return f"_get_{resolve_name(basic_auth_scheme.username).snake_case.unsafe_name}"


def get_username_member_name(basic_auth_scheme: ir_types.BasicAuthScheme) -> str:
    return f"_{resolve_name(basic_auth_scheme.username).snake_case.unsafe_name}"


def get_password_constructor_parameter_name(basic_auth_scheme: ir_types.BasicAuthScheme) -> str:
    return resolve_name(basic_auth_scheme.password).snake_case.safe_name


def get_token_constructor_parameter_name(bearer_auth_scheme: ir_types.BearerAuthScheme) -> str:
    return resolve_name(bearer_auth_scheme.token).snake_case.safe_name


def get_token_member_name(bearer_auth_scheme: ir_types.BearerAuthScheme) -> str:
    return f"_{resolve_name(bearer_auth_scheme.token).snake_case.safe_name}"


def get_token_getter_name(bearer_auth_scheme: ir_types.BearerAuthScheme) -> str:
    return f"_get_{resolve_name(bearer_auth_scheme.token).snake_case.safe_name}"


def get_password_getter_name(basic_auth_scheme: ir_types.BasicAuthScheme) -> str:
    return f"_get_{resolve_name(basic_auth_scheme.password).snake_case.unsafe_name}"


def get_password_member_name(basic_auth_scheme: ir_types.BasicAuthScheme) -> str:
    return f"_{resolve_name(basic_auth_scheme.password).snake_case.unsafe_name}"


def get_header_parameter_name(header: ir_types.HttpHeader) -> str:
    return resolve_name(get_name_from_wire_value(header.name)).snake_case.safe_name


def get_header_private_member_name(header: ir_types.HttpHeader) -> str:
    return "_" + resolve_name(get_name_from_wire_value(header.name)).snake_case.unsafe_name


def get_header_constructor_parameter_name(header: ir_types.HttpHeader) -> str:
    return resolve_name(get_name_from_wire_value(header.name)).snake_case.safe_name


def get_auth_scheme_header_constructor_parameter_name(header: ir_types.HeaderAuthScheme) -> str:
    return resolve_name(get_name_from_wire_value(header.name)).snake_case.safe_name


def get_auth_scheme_header_private_member_name(header: ir_types.HeaderAuthScheme) -> str:
    return resolve_name(get_name_from_wire_value(header.name)).snake_case.safe_name


def get_variable_constructor_parameter_name(variable: ir_types.VariableDeclaration) -> str:
    return resolve_name(variable.name).snake_case.safe_name


def get_variable_member_name(variable: ir_types.VariableDeclaration) -> str:
    return f"_{resolve_name(variable.name).snake_case.safe_name}"


def get_variable_getter_name(variable: ir_types.VariableDeclaration) -> str:
    return f"get_{resolve_name(variable.name).snake_case.safe_name}"
