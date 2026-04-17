from typing import Optional

import fern.ir.resources as ir_types


def get_availability_docs(endpoint: ir_types.HttpEndpoint) -> Optional[str]:
    """Return a docstring prefix describing the endpoint's availability.

    Mirrors ``getAvailabilityDocs`` in the TypeScript SDK generator. Python does
    not have a built-in annotation that is both widely recognized and usable on
    pre-3.13 interpreters, so in-development and pre-release statuses fall back
    to the TypeScript generator's ``@beta`` wording. Deprecated endpoints use
    the ``.. deprecated::`` Sphinx directive when a message is present and fall
    back to a plain ``@deprecated`` tag otherwise so documentation tooling and
    human readers both see the annotation.
    """
    availability = endpoint.availability
    if availability is None:
        return None

    message = availability.message
    status = availability.status

    if status is ir_types.AvailabilityStatus.DEPRECATED:
        if message is not None:
            return f".. deprecated::\n    {message}"
        return "@deprecated"
    if status is ir_types.AvailabilityStatus.IN_DEVELOPMENT:
        warning = "@beta This endpoint is in development and may change."
        return f"{warning} {message}" if message is not None else warning
    if status is ir_types.AvailabilityStatus.PRE_RELEASE:
        warning = "@beta This endpoint is in pre-release and may change."
        return f"{warning} {message}" if message is not None else warning
    return None
