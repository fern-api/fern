import json
from dataclasses import dataclass, field
from typing import List, Optional, Tuple

from fern_python.codegen import Project
from fern_python.codegen.filepath import Filepath
from fern_python.codegen.module_manager import ModuleExport
from fern_python.generators.sdk.context.sdk_generator_context import SdkGeneratorContext
from fern_python.utils import pascal_case, snake_case

import fern.ir.resources as ir_types

WEBHOOKS_MODULE_NAME = "webhooks"
WEBHOOKS_HELPER_FILE_NAME = "webhooks_helper"
DEFAULT_TIMESTAMP_TOLERANCE_SECONDS = 300


@dataclass
class _WebhookVerificationEntry:
    config: ir_types.HmacSignatureVerification
    webhook_names: List[ir_types.WebhookName] = field(default_factory=list)


def _wire_value(name_or_string: ir_types.NameAndWireValueOrString) -> str:
    if isinstance(name_or_string, str):
        return name_or_string
    return name_or_string.wire_value


def _webhook_name_to_pascal(name: ir_types.WebhookName) -> str:
    if isinstance(name, str):
        return pascal_case(name)
    return name.pascal_case.safe_name


def _map_hmac_algorithm(algorithm: ir_types.HmacAlgorithm) -> str:
    return {
        ir_types.HmacAlgorithm.SHA_256: "sha256",
        ir_types.HmacAlgorithm.SHA_1: "sha1",
        ir_types.HmacAlgorithm.SHA_384: "sha384",
        ir_types.HmacAlgorithm.SHA_512: "sha512",
    }[algorithm]


def _map_encoding(encoding: ir_types.WebhookSignatureEncoding) -> str:
    return {
        ir_types.WebhookSignatureEncoding.BASE_64: "base64",
        ir_types.WebhookSignatureEncoding.HEX: "hex",
    }[encoding]


def _map_body_hash_algorithm(algorithm: ir_types.WebhookBodyHashAlgorithm) -> str:
    return {
        ir_types.WebhookBodyHashAlgorithm.SHA_256: "sha256",
        ir_types.WebhookBodyHashAlgorithm.SHA_1: "sha1",
        ir_types.WebhookBodyHashAlgorithm.SHA_384: "sha384",
        ir_types.WebhookBodyHashAlgorithm.SHA_512: "sha512",
    }[algorithm]


def _body_hash_query_param_name(binding: ir_types.WebhookBodyHashBinding) -> str:
    return binding.location.visit(query_parameter=lambda location: location.name)


class WebhooksHelperGenerator:
    def __init__(self, context: SdkGeneratorContext, project: Project) -> None:
        self._context = context
        self._project = project

    def generate(self) -> None:
        default_entry, override_entries = self._collect_hmac_configs()
        if default_entry is None:
            return

        root_exports: List[str] = []

        self._write_helper(
            class_name="WebhooksHelper",
            module_name=WEBHOOKS_HELPER_FILE_NAME,
            config=default_entry.config,
        )
        root_exports.append("WebhooksHelper")

        for entry in override_entries:
            first_webhook_name = entry.webhook_names[0]
            class_name = f"{_webhook_name_to_pascal(first_webhook_name)}WebhooksHelper"
            self._write_helper(
                class_name=class_name,
                module_name=snake_case(class_name),
                config=entry.config,
            )
            root_exports.append(class_name)

        # Re-export the helper classes from the top-level package.
        self._project.add_init_exports(
            path=(),
            exports=[ModuleExport(from_=WEBHOOKS_MODULE_NAME, imports=root_exports)],
        )

    def _collect_hmac_configs(
        self,
    ) -> Tuple[Optional[_WebhookVerificationEntry], List[_WebhookVerificationEntry]]:
        grouped: "dict[str, _WebhookVerificationEntry]" = {}
        for webhook_group in self._context.ir.webhook_groups.values():
            for webhook in webhook_group:
                verification = webhook.signature_verification
                if verification is None:
                    continue
                config = verification.visit(
                    hmac=lambda hmac: hmac,
                    asymmetric=lambda _: None,
                )
                if config is None:
                    continue
                key = self._compute_verification_key(config)
                existing = grouped.get(key)
                if existing is not None:
                    existing.webhook_names.append(webhook.name)
                else:
                    grouped[key] = _WebhookVerificationEntry(config=config, webhook_names=[webhook.name])

        if len(grouped) == 0:
            return None, []

        # The most frequent config becomes the default WebhooksHelper (ties broken by insertion order).
        default_entry: Optional[_WebhookVerificationEntry] = None
        max_count = 0
        for entry in grouped.values():
            if len(entry.webhook_names) > max_count:
                max_count = len(entry.webhook_names)
                default_entry = entry

        override_entries = [entry for entry in grouped.values() if entry is not default_entry]
        return default_entry, override_entries

    def _compute_verification_key(self, config: ir_types.HmacSignatureVerification) -> str:
        timestamp = config.timestamp
        body_hash_binding = config.body_hash_binding
        return json.dumps(
            {
                "algorithm": config.algorithm.value,
                "encoding": config.encoding.value,
                "signaturePrefix": config.signature_prefix,
                "signatureHeaderName": _wire_value(config.signature_header_name),
                "payloadFormat": {
                    "components": [component.value for component in config.payload_format.components],
                    "delimiter": config.payload_format.delimiter,
                    "bodySort": (
                        config.payload_format.body_sort.value if config.payload_format.body_sort is not None else None
                    ),
                },
                "timestamp": (
                    None
                    if timestamp is None
                    else {
                        "headerName": _wire_value(timestamp.header_name),
                        "format": timestamp.format.value,
                        "tolerance": timestamp.tolerance,
                    }
                ),
                "bodyHashBinding": (
                    None
                    if body_hash_binding is None
                    else {
                        "algorithm": body_hash_binding.algorithm.value,
                        "encoding": body_hash_binding.encoding.value,
                        "queryParameter": _body_hash_query_param_name(body_hash_binding),
                    }
                ),
            },
            sort_keys=True,
        )

    def _write_helper(self, *, class_name: str, module_name: str, config: ir_types.HmacSignatureVerification) -> None:
        contents = _HmacHelperWriter(class_name=class_name, config=config).write()
        filepath = Filepath(
            directories=(Filepath.DirectoryFilepathPart(module_name=WEBHOOKS_MODULE_NAME),),
            file=Filepath.FilepathPart(module_name=module_name),
        )
        filepath_nested = self._project.get_source_file_filepath(filepath, include_src_root=True)
        self._project.add_file(filepath_nested, contents)
        self._project.register_export_in_project(
            filepath_in_project=filepath,
            exports={class_name},
        )


class _HmacHelperWriter:
    def __init__(self, *, class_name: str, config: ir_types.HmacSignatureVerification) -> None:
        self._class_name = class_name
        self._config = config
        self._payload_format = config.payload_format
        self._has_body_sort = config.payload_format.body_sort is not None
        self._has_timestamp = config.timestamp is not None
        self._components = list(config.payload_format.components)
        self._body_hash_binding = config.body_hash_binding

    def write(self) -> str:
        imports = self._build_imports()
        constants = self._build_constants()
        parameters = self._build_parameters()
        body = self._build_body()
        docstring = self._build_docstring()

        lines: List[str] = [
            "# This file was auto-generated by Fern from our API Definition.",
            "",
        ]
        lines.extend(imports)
        lines.append("")
        if len(constants) > 0:
            lines.extend(constants)
            lines.append("")
        lines.append("")
        lines.append(f"class {self._class_name}:")
        lines.extend(_indent(docstring, 1))
        lines.append("")
        lines.append("    @staticmethod")
        lines.append("    def verify_signature(")
        lines.append("        *,")
        for param in parameters:
            lines.append(f"        {param},")
        lines.append("    ) -> bool:")
        lines.extend(_indent(body, 2))
        return "\n".join(lines) + "\n"

    def _build_imports(self) -> List[str]:
        imports: List[str] = []
        if self._has_timestamp:
            timestamp_format = self._config.timestamp.format if self._config.timestamp is not None else None
            if timestamp_format == ir_types.WebhookTimestampFormat.ISO_8601:
                imports.append("import datetime")
            imports.append("import time")
        if self._has_body_sort:
            imports.append("import typing")
        imports.append("")
        signature_imports = ["compute_hmac_signature"]
        if self._body_hash_binding is not None:
            signature_imports.extend(["compute_hash", "get_webhook_query_parameter"])
        signature_imports.append("timing_safe_equal")
        imports.append(f"from ..core.webhook_signature import {', '.join(sorted(signature_imports))}")
        return imports

    def _build_constants(self) -> List[str]:
        constants: List[str] = []
        if self._has_timestamp:
            tolerance = DEFAULT_TIMESTAMP_TOLERANCE_SECONDS
            if self._config.timestamp is not None and self._config.timestamp.tolerance is not None:
                tolerance = self._config.timestamp.tolerance
            constants.append(f"TIMESTAMP_TOLERANCE_SECONDS = {tolerance}")
        if self._config.signature_prefix is not None:
            constants.append(f"SIGNATURE_PREFIX = {json.dumps(self._config.signature_prefix)}")
        return constants

    def _build_parameters(self) -> List[str]:
        body_type = "typing.Union[str, typing.Dict[str, str]]" if self._has_body_sort else "str"
        params: List[str] = [
            f"request_body: {body_type}",
            "signature_header: str",
            "signature_key: str",
        ]
        has_notification_url = False
        for component in self._components:
            if component == ir_types.WebhookPayloadComponent.NOTIFICATION_URL:
                params.append("notification_url: str")
                has_notification_url = True
            elif component == ir_types.WebhookPayloadComponent.MESSAGE_ID:
                params.append("message_id: str")
        if self._body_hash_binding is not None and not has_notification_url:
            params.append("notification_url: str")
        if self._has_timestamp:
            params.append("timestamp_header: str")
        return params

    def _build_body(self) -> List[str]:
        lines: List[str] = []

        lines.append("if request_body is None or signature_header is None or signature_key is None:")
        lines.append('    raise ValueError("Missing required parameters for webhook signature verification")')

        if self._has_timestamp and self._config.timestamp is not None:
            lines.append("")
            lines.extend(self._build_timestamp_validation(self._config.timestamp))

        if self._body_hash_binding is not None:
            lines.append("")
            lines.extend(self._build_body_hash_verification(self._body_hash_binding))

        signature_expr = self._build_signature_extraction(lines)

        lines.append("")
        lines.extend(self._build_payload_construction())

        lines.append("")
        algorithm = _map_hmac_algorithm(self._config.algorithm)
        encoding = _map_encoding(self._config.encoding)
        lines.append("expected = compute_hmac_signature(")
        lines.append("    payload=payload,")
        lines.append("    secret=signature_key,")
        lines.append(f'    algorithm="{algorithm}",')
        lines.append(f'    encoding="{encoding}",')
        lines.append(")")

        lines.append("")
        lines.append(f"return timing_safe_equal({signature_expr}, expected)")
        return lines

    def _build_body_hash_verification(self, binding: ir_types.WebhookBodyHashBinding) -> List[str]:
        algorithm = _map_body_hash_algorithm(binding.algorithm)
        encoding = _map_encoding(binding.encoding)
        query_param = _body_hash_query_param_name(binding)
        return [
            "expected_body_hash = compute_hash(",
            "    payload=request_body,",
            f'    algorithm="{algorithm}",',
            f'    encoding="{encoding}",',
            ")",
            f"transmitted_body_hash = get_webhook_query_parameter(notification_url, {json.dumps(query_param)})",
            "if transmitted_body_hash is None or not timing_safe_equal(",
            "    expected_body_hash, transmitted_body_hash",
            "):",
            "    return False",
        ]

    def _build_timestamp_validation(self, timestamp: ir_types.WebhookTimestampConfig) -> List[str]:
        header_name = _wire_value(timestamp.header_name)
        lines: List[str] = [
            'if timestamp_header is None or timestamp_header == "":',
            f"    raise ValueError(\"Missing timestamp header '{header_name}' for webhook signature verification\")",
            "",
        ]

        if timestamp.format == ir_types.WebhookTimestampFormat.UNIX_SECONDS:
            lines.extend(
                [
                    "try:",
                    "    timestamp_value = int(timestamp_header)",
                    "except ValueError:",
                    '    raise ValueError("Invalid timestamp format: expected unix seconds") from None',
                    "timestamp_ms = timestamp_value * 1000",
                ]
            )
        elif timestamp.format == ir_types.WebhookTimestampFormat.UNIX_MILLIS:
            lines.extend(
                [
                    "try:",
                    "    timestamp_value = int(timestamp_header)",
                    "except ValueError:",
                    '    raise ValueError("Invalid timestamp format: expected unix milliseconds") from None',
                    "timestamp_ms = timestamp_value",
                ]
            )
        else:
            lines.extend(
                [
                    "try:",
                    '    parsed_timestamp = datetime.datetime.fromisoformat(timestamp_header.replace("Z", "+00:00"))',
                    "except ValueError:",
                    '    raise ValueError("Invalid timestamp format: expected ISO 8601 date string") from None',
                    "timestamp_ms = parsed_timestamp.timestamp() * 1000",
                ]
            )

        lines.extend(
            [
                "",
                "if abs(time.time() * 1000 - timestamp_ms) > TIMESTAMP_TOLERANCE_SECONDS * 1000:",
                "    return False",
            ]
        )
        return lines

    def _build_signature_extraction(self, lines: List[str]) -> str:
        if self._config.signature_prefix is not None:
            lines.append("")
            lines.append("sig = (")
            lines.append("    signature_header[len(SIGNATURE_PREFIX) :]")
            lines.append("    if signature_header.startswith(SIGNATURE_PREFIX)")
            lines.append("    else signature_header")
            lines.append(")")
            return "sig"
        return "signature_header"

    def _build_payload_construction(self) -> List[str]:
        lines: List[str] = []
        if self._has_body_sort:
            lines.extend(
                [
                    "body_string = (",
                    "    request_body",
                    "    if isinstance(request_body, str)",
                    '    else "".join(key + request_body[key] for key in sorted(request_body))',
                    ")",
                ]
            )
            body_expr = "body_string"
        else:
            body_expr = "request_body"

        if len(self._components) == 1 and self._components[0] == ir_types.WebhookPayloadComponent.BODY:
            lines.append(f"payload = {body_expr}")
            return lines

        component_exprs: List[str] = []
        for component in self._components:
            if component == ir_types.WebhookPayloadComponent.BODY:
                component_exprs.append(body_expr)
            elif component == ir_types.WebhookPayloadComponent.TIMESTAMP:
                component_exprs.append("timestamp_header")
            elif component == ir_types.WebhookPayloadComponent.NOTIFICATION_URL:
                component_exprs.append("notification_url")
            elif component == ir_types.WebhookPayloadComponent.MESSAGE_ID:
                component_exprs.append("message_id")

        delimiter = json.dumps(self._payload_format.delimiter)
        joined = ", ".join(component_exprs)
        lines.append(f"payload = {delimiter}.join([{joined}])")
        return lines

    def _build_docstring(self) -> List[str]:
        signature_header = _wire_value(self._config.signature_header_name)
        lines: List[str] = [
            "Verify an HMAC webhook signature.",
            "",
            f'Extract the signature from the "{signature_header}" header and pass it as the signature_header parameter.',
        ]
        if self._config.timestamp is not None:
            timestamp_header = _wire_value(self._config.timestamp.header_name)
            lines.append(
                f'Extract the timestamp from the "{timestamp_header}" header and pass it as the timestamp_header parameter.'
            )
        if self._has_body_sort:
            lines.extend(
                [
                    "The request_body parameter accepts either a raw string or a dict of POST body parameters.",
                    "When a dict is provided, parameters are sorted alphabetically by key and concatenated as key-value pairs before signing.",
                ]
            )
        if self._body_hash_binding is not None:
            query_param = _body_hash_query_param_name(self._body_hash_binding)
            lines.append(
                f'The raw request_body is hashed and compared against the "{query_param}" query parameter '
                "on the notification_url before the HMAC signature is verified."
            )
        result = ['"""']
        result.extend(lines)
        result.append('"""')
        return result


def _indent(lines: List[str], levels: int) -> List[str]:
    prefix = "    " * levels
    return [f"{prefix}{line}" if line != "" else "" for line in lines]
