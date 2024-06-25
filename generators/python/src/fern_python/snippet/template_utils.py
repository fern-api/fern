from typing import List

from fdr import GenericTemplate, Template, TemplateInput

# Write this in the fern def to share between FE + BE
TEMPLATE_SENTINEL = "$FERN_INPUT"


class TemplateGenerator:
    @staticmethod
    def string_template(*, is_optional: bool, template_string_prefix: str, inputs: List[TemplateInput]) -> Template:
        return Template.factory.generic(
            GenericTemplate(
                imports=[],
                isOptional=is_optional,
                templateString=f"{template_string_prefix}={TEMPLATE_SENTINEL}",
                templateInputs=inputs,
            )
        )
