import json
from pathlib import Path
from typing import Dict, List, Optional, Set, Tuple

from fern_python.codegen import Filepath, Project

import fern.ir.resources as ir_types


class _WebhookVerificationEntry:
    def __init__(
        self,
        config: ir_types.WebhookSignatureVerification,
        webhook_names: List[ir_types.WebhookName],
    ) -> None:
        self.config = config
        self.webhook_names = webhook_names


def _compute_verification_key(config: ir_types.WebhookSignatureVerification) -> str:
    union = config.get_as_union()
    if union.type == "hmac":
        parts = [
            "hmac",
            union.algorithm.value,
            union.encoding.value,
            union.signature_prefix or "",
            union.payload_format.delimiter,
            ",".join(c.value for c in union.payload_format.components),
        ]
        if union.timestamp is not None:
            parts.extend(
                [
                    union.timestamp.header_name.wire_value,
                    union.timestamp.format.value,
                    str(union.timestamp.tolerance or 300),
                ]
            )
        return "|".join(parts)
    elif union.type == "asymmetric":
        return f"asymmetric|{union.algorithm.value}|{union.encoding.value}"
    return "unknown"


class WebhooksHelperGenerator:
    def __init__(
        self,
        *,
        ir: ir_types.IntermediateRepresentation,
        core_filepath: Tuple[Filepath.DirectoryFilepathPart, ...],
    ) -> None:
        self._ir = ir
        self._core_filepath = core_filepath

    def generate(self, *, project: Project) -> Set[str]:
        default_entry, override_entries = self._collect_webhook_verification_configs()
        if default_entry is None:
            return set()

        exports: Set[str] = set()

        default_source = self._generate_helper_class(
            config=default_entry.config,
            class_name="WebhooksHelper",
        )
        if default_source is not None:
            filepath = Filepath(
                directories=self._core_filepath,
                file=Filepath.FilepathPart(module_name="webhooks_helper_generated"),
            )
            self._write_source_file(project, filepath, default_source)
            project.register_export_in_project(
                filepath_in_project=filepath,
                exports={"WebhooksHelper"},
            )
            exports.add("WebhooksHelper")

        for override_entry in override_entries:
            first_webhook_name = override_entry.webhook_names[0]
            class_name = f"{first_webhook_name.pascal_case.safe_name}WebhooksHelper"
            module_name = f"{first_webhook_name.snake_case.safe_name}_webhooks_helper"

            override_source = self._generate_helper_class(
                config=override_entry.config,
                class_name=class_name,
            )
            if override_source is not None:
                filepath = Filepath(
                    directories=self._core_filepath,
                    file=Filepath.FilepathPart(module_name=module_name),
                )
                self._write_source_file(project, filepath, override_source)
                project.register_export_in_project(
                    filepath_in_project=filepath,
                    exports={class_name},
                )
                exports.add(class_name)

        return exports

    def _collect_webhook_verification_configs(
        self,
    ) -> Tuple[Optional[_WebhookVerificationEntry], List[_WebhookVerificationEntry]]:
        grouped: Dict[str, _WebhookVerificationEntry] = {}

        for webhook_group in self._ir.webhook_groups.values():
            for webhook in webhook_group:
                if webhook.signature_verification is None:
                    continue
                key = _compute_verification_key(webhook.signature_verification)
                existing = grouped.get(key)
                if existing is not None:
                    existing.webhook_names.append(webhook.name)
                else:
                    grouped[key] = _WebhookVerificationEntry(
                        config=webhook.signature_verification,
                        webhook_names=[webhook.name],
                    )

        if not grouped:
            return None, []

        default_entry: Optional[_WebhookVerificationEntry] = None
        max_count = 0
        for entry in grouped.values():
            if len(entry.webhook_names) > max_count:
                max_count = len(entry.webhook_names)
                default_entry = entry

        override_entries = [entry for entry in grouped.values() if entry is not default_entry]

        return default_entry, override_entries

    @staticmethod
    def _write_source_file(project: Project, filepath: Filepath, contents: str) -> None:
        abs_path = project.get_source_file_filepath(filepath, include_src_root=True)
        file = Path(abs_path)
        file.parent.mkdir(exist_ok=True, parents=True)
        file.write_text(contents)

    def _generate_helper_class(
        self,
        config: ir_types.WebhookSignatureVerification,
        class_name: str,
    ) -> Optional[str]:
        union = config.get_as_union()
        if union.type == "hmac":
            return self._generate_hmac_source(union, class_name)
        return None

    def _generate_hmac_source(
        self,
        config: ir_types.HmacSignatureVerification,
        class_name: str,
    ) -> str:
        algorithm = self._map_hmac_algorithm(config.algorithm)
        encoding = self._map_encoding(config.encoding)

        params: List[str] = []
        params.append("        request_body: str,")
        params.append("        signature_header: str,")
        params.append("        signature_key: str,")

        for component in config.payload_format.components:
            if component.value == "NOTIFICATION_URL":
                params.append("        notification_url: str,")
            elif component.value == "MESSAGE_ID":
                params.append("        message_id: str,")

        if config.timestamp is not None:
            params.append("        timestamp_header: str,")

        params_str = "\n".join(params)

        body_lines: List[str] = []

        body_lines.append(
            "        if request_body is None or signature_header is None or signature_key is None:"
        )
        body_lines.append(
            '            raise ValueError("Missing required parameters'
            ' for webhook signature verification")'
        )

        if config.timestamp is not None:
            tolerance = config.timestamp.tolerance or 300
            ts_format = self._map_timestamp_format(config.timestamp.format)
            header_name = config.timestamp.header_name.wire_value

            body_lines.append("")
            body_lines.append('        if not timestamp_header or timestamp_header == "":')
            msg = json.dumps(
                f"Missing timestamp header '{header_name}' for webhook signature verification"
            )
            body_lines.append(f"            raise ValueError({msg})")
            body_lines.append("")
            body_lines.append(
                f'        timestamp_ms = _parse_timestamp_ms(timestamp_header, "{ts_format}")'
            )
            body_lines.append(
                f"        if abs(_get_current_time_ms() - timestamp_ms) > {tolerance} * 1000:"
            )
            body_lines.append("            return False")

        if config.signature_prefix is not None:
            prefix_repr = json.dumps(config.signature_prefix)
            body_lines.append("")
            body_lines.append("        sig = signature_header")
            body_lines.append(f"        if sig.startswith({prefix_repr}):")
            body_lines.append(f"            sig = sig[{len(config.signature_prefix)}:]")
        else:
            body_lines.append("")
            body_lines.append("        sig = signature_header")

        body_lines.append("")
        if (
            len(config.payload_format.components) == 1
            and config.payload_format.components[0].value == "BODY"
        ):
            body_lines.append("        payload = request_body")
        else:
            component_exprs: List[str] = []
            for component in config.payload_format.components:
                if component.value == "BODY":
                    component_exprs.append("request_body")
                elif component.value == "TIMESTAMP":
                    component_exprs.append("timestamp_header")
                elif component.value == "NOTIFICATION_URL":
                    component_exprs.append("notification_url")
                elif component.value == "MESSAGE_ID":
                    component_exprs.append("message_id")

            delimiter_repr = json.dumps(config.payload_format.delimiter)
            components_str = ", ".join(component_exprs)
            body_lines.append(
                f"        payload = {delimiter_repr}.join([{components_str}])"
            )

        body_lines.append("")
        body_lines.append("        expected = _compute_hmac_signature(")
        body_lines.append("            payload=payload,")
        body_lines.append("            secret=signature_key,")
        body_lines.append(f'            algorithm="{algorithm}",')
        body_lines.append(f'            encoding="{encoding}",')
        body_lines.append("        )")

        body_lines.append("")
        body_lines.append("        return _timing_safe_equals(sig, expected)")

        body_str = "\n".join(body_lines)

        doc_lines: List[str] = []
        doc_lines.append("    Verify an HMAC webhook signature.")
        doc_lines.append("")
        doc_lines.append(
            f'    Extract the signature from the "{config.signature_header_name.wire_value}"'
            " header and pass it as the signature_header parameter."
        )
        if config.timestamp is not None:
            doc_lines.append(
                f'    Extract the timestamp from the "{config.timestamp.header_name.wire_value}"'
                " header and pass it as the timestamp_header parameter."
            )
        docstring = "\n".join(doc_lines)

        imports = [
            "from .webhooks_helper import _compute_hmac_signature",
            "from .webhooks_helper import _timing_safe_equals",
        ]
        if config.timestamp is not None:
            imports.append("from .webhooks_helper import _parse_timestamp_ms")
            imports.append("from .webhooks_helper import _get_current_time_ms")
        import_str = "\n".join(imports)

        lines = [
            "# This file was auto-generated by Fern from our API Definition.",
            "",
            import_str,
            "",
            "",
            "class " + class_name + ":",
            '    """',
            docstring,
            '    """',
            "",
            "    @staticmethod",
            "    def verify_signature(",
            "        *,",
            params_str,
            "    ) -> bool:",
            body_str,
        ]

        return "\n".join(lines) + "\n"

    @staticmethod
    def _map_hmac_algorithm(algorithm: ir_types.HmacAlgorithm) -> str:
        mapping = {
            "SHA256": "sha256",
            "SHA1": "sha1",
            "SHA384": "sha384",
            "SHA512": "sha512",
        }
        return mapping.get(algorithm.value, "sha256")

    @staticmethod
    def _map_encoding(encoding: ir_types.WebhookSignatureEncoding) -> str:
        mapping = {
            "BASE64": "base64",
            "HEX": "hex",
        }
        return mapping.get(encoding.value, "hex")

    @staticmethod
    def _map_timestamp_format(format: ir_types.WebhookTimestampFormat) -> str:
        mapping = {
            "UNIX_SECONDS": "unix_seconds",
            "UNIX_MILLIS": "unix_millis",
            "ISO8601": "iso8601",
        }
        return mapping.get(format.value, "unix_seconds")
