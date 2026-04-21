from typing import Optional

import fern.ir.resources as ir_types


def get_availability_docs(endpoint: ir_types.HttpEndpoint) -> Optional[str]:
    """Return a docstring prefix describing the endpoint's availability.

    Uses Sphinx admonition directives so documentation tooling (PyCharm Quick
    Documentation, VSCode Pylance, mkdocstrings, Sphinx itself) renders the
    annotation consistently. Deprecated endpoints use ``.. deprecated::``;
    in-development and pre-release endpoints use ``.. warning::``.
    """
    availability = endpoint.availability
    if availability is None:
        return None

    message = availability.message
    status = availability.status

    if status == ir_types.AvailabilityStatus.DEPRECATED:
        if message is not None:
            return f".. deprecated::\n    {message}"
        return "@deprecated"
    if status == ir_types.AvailabilityStatus.IN_DEVELOPMENT:
        base = "This endpoint is in development and may change."
        body = f"{base} {message}" if message is not None else base
        return f".. warning::\n    {body}"
    if status == ir_types.AvailabilityStatus.PRE_RELEASE:
        base = "This endpoint is in pre-release and may change."
        body = f"{base} {message}" if message is not None else base
        return f".. warning::\n    {body}"
    return None
