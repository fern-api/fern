# This file was auto-generated by Fern from our API Definition.

from seed import SeedTrace
from seed import AsyncSeedTrace
import uuid
from seed.submission import TestSubmissionStatus
import datetime
from seed.submission import TestSubmissionUpdateInfo_Running
from seed.submission import WorkspaceSubmissionStatus
from seed.submission import WorkspaceSubmissionUpdateInfo_Running
from seed.submission import TestCaseResultWithStdout
from seed.submission import TestCaseResult
from seed.commons import VariableValue_IntegerValue
from seed.submission import ActualResult_Value
from seed.submission import TraceResponse
from seed.commons import DebugVariableValue_IntegerValue
from seed.submission import ExpressionLocation
from seed.submission import StackInformation
from seed.submission import StackFrame
from seed.submission import Scope
from seed.submission import TraceResponseV2
from seed.submission import TracedFile
from seed.submission import WorkspaceRunDetails
from seed.submission import ExceptionV2_Generic
from seed.submission import ExceptionInfo


async def test_update_test_submission_status(client: SeedTrace, async_client: AsyncSeedTrace) -> None:
    # Type ignore to avoid mypy complaining about the function not being meant to return a value
    assert (
        client.admin.update_test_submission_status(
            submission_id=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
            request=TestSubmissionStatus(),
        )  # type: ignore[func-returns-value]
        is None
    )

    assert (
        await async_client.admin.update_test_submission_status(
            submission_id=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
            request=TestSubmissionStatus(),
        )  # type: ignore[func-returns-value]
        is None
    )


async def test_send_test_submission_update(client: SeedTrace, async_client: AsyncSeedTrace) -> None:
    # Type ignore to avoid mypy complaining about the function not being meant to return a value
    assert (
        client.admin.send_test_submission_update(
            submission_id=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
            update_time=datetime.datetime.fromisoformat("2024-01-15 09:30:00+00:00"),
            update_info=TestSubmissionUpdateInfo_Running(value="QUEUEING_SUBMISSION"),
        )  # type: ignore[func-returns-value]
        is None
    )

    assert (
        await async_client.admin.send_test_submission_update(
            submission_id=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
            update_time=datetime.datetime.fromisoformat("2024-01-15 09:30:00+00:00"),
            update_info=TestSubmissionUpdateInfo_Running(value="QUEUEING_SUBMISSION"),
        )  # type: ignore[func-returns-value]
        is None
    )


async def test_update_workspace_submission_status(client: SeedTrace, async_client: AsyncSeedTrace) -> None:
    # Type ignore to avoid mypy complaining about the function not being meant to return a value
    assert (
        client.admin.update_workspace_submission_status(
            submission_id=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
            request=WorkspaceSubmissionStatus(),
        )  # type: ignore[func-returns-value]
        is None
    )

    assert (
        await async_client.admin.update_workspace_submission_status(
            submission_id=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
            request=WorkspaceSubmissionStatus(),
        )  # type: ignore[func-returns-value]
        is None
    )


async def test_send_workspace_submission_update(client: SeedTrace, async_client: AsyncSeedTrace) -> None:
    # Type ignore to avoid mypy complaining about the function not being meant to return a value
    assert (
        client.admin.send_workspace_submission_update(
            submission_id=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
            update_time=datetime.datetime.fromisoformat("2024-01-15 09:30:00+00:00"),
            update_info=WorkspaceSubmissionUpdateInfo_Running(value="QUEUEING_SUBMISSION"),
        )  # type: ignore[func-returns-value]
        is None
    )

    assert (
        await async_client.admin.send_workspace_submission_update(
            submission_id=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
            update_time=datetime.datetime.fromisoformat("2024-01-15 09:30:00+00:00"),
            update_info=WorkspaceSubmissionUpdateInfo_Running(value="QUEUEING_SUBMISSION"),
        )  # type: ignore[func-returns-value]
        is None
    )


async def test_store_traced_test_case(client: SeedTrace, async_client: AsyncSeedTrace) -> None:
    # Type ignore to avoid mypy complaining about the function not being meant to return a value
    assert (
        client.admin.store_traced_test_case(
            submission_id=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
            test_case_id="testCaseId",
            result=TestCaseResultWithStdout(
                result=TestCaseResult(
                    expected_result=VariableValue_IntegerValue(value=1),
                    actual_result=ActualResult_Value(value=VariableValue_IntegerValue(value=1)),
                    passed=True,
                ),
                stdout="stdout",
            ),
            trace_responses=[
                TraceResponse(
                    submission_id=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
                    line_number=1,
                    return_value=DebugVariableValue_IntegerValue(value=1),
                    expression_location=ExpressionLocation(start=1, offset=1),
                    stack=StackInformation(
                        num_stack_frames=1,
                        top_stack_frame=StackFrame(
                            method_name="methodName",
                            line_number=1,
                            scopes=[
                                Scope(variables={"variables": DebugVariableValue_IntegerValue(value=1)}),
                                Scope(variables={"variables": DebugVariableValue_IntegerValue(value=1)}),
                            ],
                        ),
                    ),
                    stdout="stdout",
                ),
                TraceResponse(
                    submission_id=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
                    line_number=1,
                    return_value=DebugVariableValue_IntegerValue(value=1),
                    expression_location=ExpressionLocation(start=1, offset=1),
                    stack=StackInformation(
                        num_stack_frames=1,
                        top_stack_frame=StackFrame(
                            method_name="methodName",
                            line_number=1,
                            scopes=[
                                Scope(variables={"variables": DebugVariableValue_IntegerValue(value=1)}),
                                Scope(variables={"variables": DebugVariableValue_IntegerValue(value=1)}),
                            ],
                        ),
                    ),
                    stdout="stdout",
                ),
            ],
        )  # type: ignore[func-returns-value]
        is None
    )

    assert (
        await async_client.admin.store_traced_test_case(
            submission_id=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
            test_case_id="testCaseId",
            result=TestCaseResultWithStdout(
                result=TestCaseResult(
                    expected_result=VariableValue_IntegerValue(value=1),
                    actual_result=ActualResult_Value(value=VariableValue_IntegerValue(value=1)),
                    passed=True,
                ),
                stdout="stdout",
            ),
            trace_responses=[
                TraceResponse(
                    submission_id=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
                    line_number=1,
                    return_value=DebugVariableValue_IntegerValue(value=1),
                    expression_location=ExpressionLocation(start=1, offset=1),
                    stack=StackInformation(
                        num_stack_frames=1,
                        top_stack_frame=StackFrame(
                            method_name="methodName",
                            line_number=1,
                            scopes=[
                                Scope(variables={"variables": DebugVariableValue_IntegerValue(value=1)}),
                                Scope(variables={"variables": DebugVariableValue_IntegerValue(value=1)}),
                            ],
                        ),
                    ),
                    stdout="stdout",
                ),
                TraceResponse(
                    submission_id=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
                    line_number=1,
                    return_value=DebugVariableValue_IntegerValue(value=1),
                    expression_location=ExpressionLocation(start=1, offset=1),
                    stack=StackInformation(
                        num_stack_frames=1,
                        top_stack_frame=StackFrame(
                            method_name="methodName",
                            line_number=1,
                            scopes=[
                                Scope(variables={"variables": DebugVariableValue_IntegerValue(value=1)}),
                                Scope(variables={"variables": DebugVariableValue_IntegerValue(value=1)}),
                            ],
                        ),
                    ),
                    stdout="stdout",
                ),
            ],
        )  # type: ignore[func-returns-value]
        is None
    )


async def test_store_traced_test_case_v_2(client: SeedTrace, async_client: AsyncSeedTrace) -> None:
    # Type ignore to avoid mypy complaining about the function not being meant to return a value
    assert (
        client.admin.store_traced_test_case_v_2(
            submission_id=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
            test_case_id="testCaseId",
            request=[
                TraceResponseV2(
                    submission_id=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
                    line_number=1,
                    file=TracedFile(filename="filename", directory="directory"),
                    return_value=DebugVariableValue_IntegerValue(value=1),
                    expression_location=ExpressionLocation(start=1, offset=1),
                    stack=StackInformation(
                        num_stack_frames=1,
                        top_stack_frame=StackFrame(
                            method_name="methodName",
                            line_number=1,
                            scopes=[
                                Scope(variables={"variables": DebugVariableValue_IntegerValue(value=1)}),
                                Scope(variables={"variables": DebugVariableValue_IntegerValue(value=1)}),
                            ],
                        ),
                    ),
                    stdout="stdout",
                ),
                TraceResponseV2(
                    submission_id=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
                    line_number=1,
                    file=TracedFile(filename="filename", directory="directory"),
                    return_value=DebugVariableValue_IntegerValue(value=1),
                    expression_location=ExpressionLocation(start=1, offset=1),
                    stack=StackInformation(
                        num_stack_frames=1,
                        top_stack_frame=StackFrame(
                            method_name="methodName",
                            line_number=1,
                            scopes=[
                                Scope(variables={"variables": DebugVariableValue_IntegerValue(value=1)}),
                                Scope(variables={"variables": DebugVariableValue_IntegerValue(value=1)}),
                            ],
                        ),
                    ),
                    stdout="stdout",
                ),
            ],
        )  # type: ignore[func-returns-value]
        is None
    )

    assert (
        await async_client.admin.store_traced_test_case_v_2(
            submission_id=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
            test_case_id="testCaseId",
            request=[
                TraceResponseV2(
                    submission_id=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
                    line_number=1,
                    file=TracedFile(filename="filename", directory="directory"),
                    return_value=DebugVariableValue_IntegerValue(value=1),
                    expression_location=ExpressionLocation(start=1, offset=1),
                    stack=StackInformation(
                        num_stack_frames=1,
                        top_stack_frame=StackFrame(
                            method_name="methodName",
                            line_number=1,
                            scopes=[
                                Scope(variables={"variables": DebugVariableValue_IntegerValue(value=1)}),
                                Scope(variables={"variables": DebugVariableValue_IntegerValue(value=1)}),
                            ],
                        ),
                    ),
                    stdout="stdout",
                ),
                TraceResponseV2(
                    submission_id=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
                    line_number=1,
                    file=TracedFile(filename="filename", directory="directory"),
                    return_value=DebugVariableValue_IntegerValue(value=1),
                    expression_location=ExpressionLocation(start=1, offset=1),
                    stack=StackInformation(
                        num_stack_frames=1,
                        top_stack_frame=StackFrame(
                            method_name="methodName",
                            line_number=1,
                            scopes=[
                                Scope(variables={"variables": DebugVariableValue_IntegerValue(value=1)}),
                                Scope(variables={"variables": DebugVariableValue_IntegerValue(value=1)}),
                            ],
                        ),
                    ),
                    stdout="stdout",
                ),
            ],
        )  # type: ignore[func-returns-value]
        is None
    )


async def test_store_traced_workspace(client: SeedTrace, async_client: AsyncSeedTrace) -> None:
    # Type ignore to avoid mypy complaining about the function not being meant to return a value
    assert (
        client.admin.store_traced_workspace(
            submission_id=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
            workspace_run_details=WorkspaceRunDetails(
                exception_v_2=ExceptionV2_Generic(
                    exception_type="exceptionType",
                    exception_message="exceptionMessage",
                    exception_stacktrace="exceptionStacktrace",
                ),
                exception=ExceptionInfo(
                    exception_type="exceptionType",
                    exception_message="exceptionMessage",
                    exception_stacktrace="exceptionStacktrace",
                ),
                stdout="stdout",
            ),
            trace_responses=[
                TraceResponse(
                    submission_id=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
                    line_number=1,
                    return_value=DebugVariableValue_IntegerValue(value=1),
                    expression_location=ExpressionLocation(start=1, offset=1),
                    stack=StackInformation(
                        num_stack_frames=1,
                        top_stack_frame=StackFrame(
                            method_name="methodName",
                            line_number=1,
                            scopes=[
                                Scope(variables={"variables": DebugVariableValue_IntegerValue(value=1)}),
                                Scope(variables={"variables": DebugVariableValue_IntegerValue(value=1)}),
                            ],
                        ),
                    ),
                    stdout="stdout",
                ),
                TraceResponse(
                    submission_id=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
                    line_number=1,
                    return_value=DebugVariableValue_IntegerValue(value=1),
                    expression_location=ExpressionLocation(start=1, offset=1),
                    stack=StackInformation(
                        num_stack_frames=1,
                        top_stack_frame=StackFrame(
                            method_name="methodName",
                            line_number=1,
                            scopes=[
                                Scope(variables={"variables": DebugVariableValue_IntegerValue(value=1)}),
                                Scope(variables={"variables": DebugVariableValue_IntegerValue(value=1)}),
                            ],
                        ),
                    ),
                    stdout="stdout",
                ),
            ],
        )  # type: ignore[func-returns-value]
        is None
    )

    assert (
        await async_client.admin.store_traced_workspace(
            submission_id=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
            workspace_run_details=WorkspaceRunDetails(
                exception_v_2=ExceptionV2_Generic(
                    exception_type="exceptionType",
                    exception_message="exceptionMessage",
                    exception_stacktrace="exceptionStacktrace",
                ),
                exception=ExceptionInfo(
                    exception_type="exceptionType",
                    exception_message="exceptionMessage",
                    exception_stacktrace="exceptionStacktrace",
                ),
                stdout="stdout",
            ),
            trace_responses=[
                TraceResponse(
                    submission_id=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
                    line_number=1,
                    return_value=DebugVariableValue_IntegerValue(value=1),
                    expression_location=ExpressionLocation(start=1, offset=1),
                    stack=StackInformation(
                        num_stack_frames=1,
                        top_stack_frame=StackFrame(
                            method_name="methodName",
                            line_number=1,
                            scopes=[
                                Scope(variables={"variables": DebugVariableValue_IntegerValue(value=1)}),
                                Scope(variables={"variables": DebugVariableValue_IntegerValue(value=1)}),
                            ],
                        ),
                    ),
                    stdout="stdout",
                ),
                TraceResponse(
                    submission_id=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
                    line_number=1,
                    return_value=DebugVariableValue_IntegerValue(value=1),
                    expression_location=ExpressionLocation(start=1, offset=1),
                    stack=StackInformation(
                        num_stack_frames=1,
                        top_stack_frame=StackFrame(
                            method_name="methodName",
                            line_number=1,
                            scopes=[
                                Scope(variables={"variables": DebugVariableValue_IntegerValue(value=1)}),
                                Scope(variables={"variables": DebugVariableValue_IntegerValue(value=1)}),
                            ],
                        ),
                    ),
                    stdout="stdout",
                ),
            ],
        )  # type: ignore[func-returns-value]
        is None
    )


async def test_store_traced_workspace_v_2(client: SeedTrace, async_client: AsyncSeedTrace) -> None:
    # Type ignore to avoid mypy complaining about the function not being meant to return a value
    assert (
        client.admin.store_traced_workspace_v_2(
            submission_id=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
            request=[
                TraceResponseV2(
                    submission_id=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
                    line_number=1,
                    file=TracedFile(filename="filename", directory="directory"),
                    return_value=DebugVariableValue_IntegerValue(value=1),
                    expression_location=ExpressionLocation(start=1, offset=1),
                    stack=StackInformation(
                        num_stack_frames=1,
                        top_stack_frame=StackFrame(
                            method_name="methodName",
                            line_number=1,
                            scopes=[
                                Scope(variables={"variables": DebugVariableValue_IntegerValue(value=1)}),
                                Scope(variables={"variables": DebugVariableValue_IntegerValue(value=1)}),
                            ],
                        ),
                    ),
                    stdout="stdout",
                ),
                TraceResponseV2(
                    submission_id=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
                    line_number=1,
                    file=TracedFile(filename="filename", directory="directory"),
                    return_value=DebugVariableValue_IntegerValue(value=1),
                    expression_location=ExpressionLocation(start=1, offset=1),
                    stack=StackInformation(
                        num_stack_frames=1,
                        top_stack_frame=StackFrame(
                            method_name="methodName",
                            line_number=1,
                            scopes=[
                                Scope(variables={"variables": DebugVariableValue_IntegerValue(value=1)}),
                                Scope(variables={"variables": DebugVariableValue_IntegerValue(value=1)}),
                            ],
                        ),
                    ),
                    stdout="stdout",
                ),
            ],
        )  # type: ignore[func-returns-value]
        is None
    )

    assert (
        await async_client.admin.store_traced_workspace_v_2(
            submission_id=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
            request=[
                TraceResponseV2(
                    submission_id=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
                    line_number=1,
                    file=TracedFile(filename="filename", directory="directory"),
                    return_value=DebugVariableValue_IntegerValue(value=1),
                    expression_location=ExpressionLocation(start=1, offset=1),
                    stack=StackInformation(
                        num_stack_frames=1,
                        top_stack_frame=StackFrame(
                            method_name="methodName",
                            line_number=1,
                            scopes=[
                                Scope(variables={"variables": DebugVariableValue_IntegerValue(value=1)}),
                                Scope(variables={"variables": DebugVariableValue_IntegerValue(value=1)}),
                            ],
                        ),
                    ),
                    stdout="stdout",
                ),
                TraceResponseV2(
                    submission_id=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
                    line_number=1,
                    file=TracedFile(filename="filename", directory="directory"),
                    return_value=DebugVariableValue_IntegerValue(value=1),
                    expression_location=ExpressionLocation(start=1, offset=1),
                    stack=StackInformation(
                        num_stack_frames=1,
                        top_stack_frame=StackFrame(
                            method_name="methodName",
                            line_number=1,
                            scopes=[
                                Scope(variables={"variables": DebugVariableValue_IntegerValue(value=1)}),
                                Scope(variables={"variables": DebugVariableValue_IntegerValue(value=1)}),
                            ],
                        ),
                    ),
                    stdout="stdout",
                ),
            ],
        )  # type: ignore[func-returns-value]
        is None
    )
