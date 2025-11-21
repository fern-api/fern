"""
Test that verifies all types in the SDK can be imported and instantiated.

This test runs each type import/instantiation in a subprocess to avoid import cache issues.
It allows Pydantic ValidationError (expected when instantiating without required fields)
but catches other errors like circular imports, missing dependencies, etc.
"""

import subprocess
import sys

import pytest


@pytest.mark.parametrize(
    "module_name,class_name",
    [
        ("seed.admin.types.test", "Test"),
        ("seed.commons.types.binary_tree_node_and_tree_value", "BinaryTreeNodeAndTreeValue"),
        ("seed.commons.types.binary_tree_node_value", "BinaryTreeNodeValue"),
        ("seed.commons.types.binary_tree_value", "BinaryTreeValue"),
        ("seed.commons.types.debug_key_value_pairs", "DebugKeyValuePairs"),
        ("seed.commons.types.debug_map_value", "DebugMapValue"),
        ("seed.commons.types.debug_variable_value", "DebugVariableValue"),
        ("seed.commons.types.doubly_linked_list_node_and_list_value", "DoublyLinkedListNodeAndListValue"),
        ("seed.commons.types.doubly_linked_list_node_value", "DoublyLinkedListNodeValue"),
        ("seed.commons.types.doubly_linked_list_value", "DoublyLinkedListValue"),
        ("seed.commons.types.file_info", "FileInfo"),
        ("seed.commons.types.generic_value", "GenericValue"),
        ("seed.commons.types.key_value_pair", "KeyValuePair"),
        ("seed.commons.types.language", "Language"),
        ("seed.commons.types.list_type", "ListType"),
        ("seed.commons.types.map_type", "MapType"),
        ("seed.commons.types.map_value", "MapValue"),
        ("seed.commons.types.node_id", "NodeId"),
        ("seed.commons.types.problem_id", "ProblemId"),
        ("seed.commons.types.singly_linked_list_node_and_list_value", "SinglyLinkedListNodeAndListValue"),
        ("seed.commons.types.singly_linked_list_node_value", "SinglyLinkedListNodeValue"),
        ("seed.commons.types.singly_linked_list_value", "SinglyLinkedListValue"),
        ("seed.commons.types.test_case", "TestCase"),
        ("seed.commons.types.test_case_with_expected_result", "TestCaseWithExpectedResult"),
        ("seed.commons.types.user_id", "UserId"),
        ("seed.commons.types.variable_type", "VariableType"),
        ("seed.commons.types.variable_value", "VariableValue"),
        ("seed.lang_server.types.lang_server_request", "LangServerRequest"),
        ("seed.lang_server.types.lang_server_response", "LangServerResponse"),
        ("seed.migration.types.migration", "Migration"),
        ("seed.migration.types.migration_status", "MigrationStatus"),
        ("seed.playlist.types.playlist", "Playlist"),
        ("seed.playlist.types.playlist_create_request", "PlaylistCreateRequest"),
        ("seed.playlist.types.playlist_id", "PlaylistId"),
        ("seed.playlist.types.playlist_id_not_found_error_body", "PlaylistIdNotFoundErrorBody"),
        ("seed.playlist.types.reserved_keyword_enum", "ReservedKeywordEnum"),
        ("seed.playlist.types.update_playlist_request", "UpdatePlaylistRequest"),
        ("seed.problem.types.create_problem_error", "CreateProblemError"),
        ("seed.problem.types.create_problem_request", "CreateProblemRequest"),
        ("seed.problem.types.create_problem_response", "CreateProblemResponse"),
        ("seed.problem.types.generic_create_problem_error", "GenericCreateProblemError"),
        ("seed.problem.types.get_default_starter_files_response", "GetDefaultStarterFilesResponse"),
        ("seed.problem.types.problem_description", "ProblemDescription"),
        ("seed.problem.types.problem_description_board", "ProblemDescriptionBoard"),
        ("seed.problem.types.problem_files", "ProblemFiles"),
        ("seed.problem.types.problem_info", "ProblemInfo"),
        ("seed.problem.types.update_problem_response", "UpdateProblemResponse"),
        ("seed.problem.types.variable_type_and_name", "VariableTypeAndName"),
        ("seed.submission.types.actual_result", "ActualResult"),
        ("seed.submission.types.building_executor_response", "BuildingExecutorResponse"),
        ("seed.submission.types.code_execution_update", "CodeExecutionUpdate"),
        ("seed.submission.types.compile_error", "CompileError"),
        ("seed.submission.types.custom_test_cases_unsupported", "CustomTestCasesUnsupported"),
        ("seed.submission.types.error_info", "ErrorInfo"),
        ("seed.submission.types.errored_response", "ErroredResponse"),
        ("seed.submission.types.exception_info", "ExceptionInfo"),
        ("seed.submission.types.exception_v_2", "ExceptionV2"),
        ("seed.submission.types.execution_session_response", "ExecutionSessionResponse"),
        ("seed.submission.types.execution_session_state", "ExecutionSessionState"),
        ("seed.submission.types.execution_session_status", "ExecutionSessionStatus"),
        ("seed.submission.types.existing_submission_executing", "ExistingSubmissionExecuting"),
        ("seed.submission.types.expression_location", "ExpressionLocation"),
        ("seed.submission.types.finished_response", "FinishedResponse"),
        ("seed.submission.types.get_execution_session_state_response", "GetExecutionSessionStateResponse"),
        ("seed.submission.types.get_submission_state_response", "GetSubmissionStateResponse"),
        ("seed.submission.types.get_trace_responses_page_request", "GetTraceResponsesPageRequest"),
        ("seed.submission.types.graded_response", "GradedResponse"),
        ("seed.submission.types.graded_response_v_2", "GradedResponseV2"),
        ("seed.submission.types.graded_test_case_update", "GradedTestCaseUpdate"),
        ("seed.submission.types.initialize_problem_request", "InitializeProblemRequest"),
        ("seed.submission.types.internal_error", "InternalError"),
        ("seed.submission.types.invalid_request_cause", "InvalidRequestCause"),
        ("seed.submission.types.invalid_request_response", "InvalidRequestResponse"),
        ("seed.submission.types.lightweight_stackframe_information", "LightweightStackframeInformation"),
        ("seed.submission.types.recorded_response_notification", "RecordedResponseNotification"),
        ("seed.submission.types.recorded_test_case_update", "RecordedTestCaseUpdate"),
        ("seed.submission.types.recording_response_notification", "RecordingResponseNotification"),
        ("seed.submission.types.running_response", "RunningResponse"),
        ("seed.submission.types.running_submission_state", "RunningSubmissionState"),
        ("seed.submission.types.runtime_error", "RuntimeError"),
        ("seed.submission.types.scope", "Scope"),
        ("seed.submission.types.share_id", "ShareId"),
        ("seed.submission.types.stack_frame", "StackFrame"),
        ("seed.submission.types.stack_information", "StackInformation"),
        ("seed.submission.types.stderr_response", "StderrResponse"),
        ("seed.submission.types.stdout_response", "StdoutResponse"),
        ("seed.submission.types.stop_request", "StopRequest"),
        ("seed.submission.types.stopped_response", "StoppedResponse"),
        ("seed.submission.types.submission_file_info", "SubmissionFileInfo"),
        ("seed.submission.types.submission_id", "SubmissionId"),
        ("seed.submission.types.submission_id_not_found", "SubmissionIdNotFound"),
        ("seed.submission.types.submission_request", "SubmissionRequest"),
        ("seed.submission.types.submission_response", "SubmissionResponse"),
        ("seed.submission.types.submission_status_for_test_case", "SubmissionStatusForTestCase"),
        ("seed.submission.types.submission_status_v_2", "SubmissionStatusV2"),
        ("seed.submission.types.submission_type_enum", "SubmissionTypeEnum"),
        ("seed.submission.types.submission_type_state", "SubmissionTypeState"),
        ("seed.submission.types.submit_request_v_2", "SubmitRequestV2"),
        ("seed.submission.types.terminated_response", "TerminatedResponse"),
        ("seed.submission.types.test_case_grade", "TestCaseGrade"),
        ("seed.submission.types.test_case_hidden_grade", "TestCaseHiddenGrade"),
        ("seed.submission.types.test_case_non_hidden_grade", "TestCaseNonHiddenGrade"),
        ("seed.submission.types.test_case_result", "TestCaseResult"),
        ("seed.submission.types.test_case_result_with_stdout", "TestCaseResultWithStdout"),
        ("seed.submission.types.test_submission_state", "TestSubmissionState"),
        ("seed.submission.types.test_submission_status", "TestSubmissionStatus"),
        ("seed.submission.types.test_submission_status_v_2", "TestSubmissionStatusV2"),
        ("seed.submission.types.test_submission_update", "TestSubmissionUpdate"),
        ("seed.submission.types.test_submission_update_info", "TestSubmissionUpdateInfo"),
        ("seed.submission.types.trace_response", "TraceResponse"),
        ("seed.submission.types.trace_response_v_2", "TraceResponseV2"),
        ("seed.submission.types.trace_responses_page", "TraceResponsesPage"),
        ("seed.submission.types.trace_responses_page_v_2", "TraceResponsesPageV2"),
        ("seed.submission.types.traced_file", "TracedFile"),
        ("seed.submission.types.traced_test_case", "TracedTestCase"),
        ("seed.submission.types.unexpected_language_error", "UnexpectedLanguageError"),
        ("seed.submission.types.workspace_files", "WorkspaceFiles"),
        ("seed.submission.types.workspace_ran_response", "WorkspaceRanResponse"),
        ("seed.submission.types.workspace_run_details", "WorkspaceRunDetails"),
        ("seed.submission.types.workspace_starter_files_response", "WorkspaceStarterFilesResponse"),
        ("seed.submission.types.workspace_starter_files_response_v_2", "WorkspaceStarterFilesResponseV2"),
        ("seed.submission.types.workspace_submission_state", "WorkspaceSubmissionState"),
        ("seed.submission.types.workspace_submission_status", "WorkspaceSubmissionStatus"),
        ("seed.submission.types.workspace_submission_status_v_2", "WorkspaceSubmissionStatusV2"),
        ("seed.submission.types.workspace_submission_update", "WorkspaceSubmissionUpdate"),
        ("seed.submission.types.workspace_submission_update_info", "WorkspaceSubmissionUpdateInfo"),
        ("seed.submission.types.workspace_submit_request", "WorkspaceSubmitRequest"),
        ("seed.submission.types.workspace_traced_update", "WorkspaceTracedUpdate"),
        ("seed.v_2.problem.types.assert_correctness_check", "AssertCorrectnessCheck"),
        ("seed.v_2.problem.types.basic_custom_files", "BasicCustomFiles"),
        ("seed.v_2.problem.types.basic_test_case_template", "BasicTestCaseTemplate"),
        ("seed.v_2.problem.types.create_problem_request_v_2", "CreateProblemRequestV2"),
        ("seed.v_2.problem.types.custom_files", "CustomFiles"),
        ("seed.v_2.problem.types.deep_equality_correctness_check", "DeepEqualityCorrectnessCheck"),
        ("seed.v_2.problem.types.default_provided_file", "DefaultProvidedFile"),
        ("seed.v_2.problem.types.file_info_v_2", "FileInfoV2"),
        ("seed.v_2.problem.types.files", "Files"),
        ("seed.v_2.problem.types.function_implementation", "FunctionImplementation"),
        (
            "seed.v_2.problem.types.function_implementation_for_multiple_languages",
            "FunctionImplementationForMultipleLanguages",
        ),
        ("seed.v_2.problem.types.function_signature", "FunctionSignature"),
        ("seed.v_2.problem.types.generated_files", "GeneratedFiles"),
        ("seed.v_2.problem.types.get_basic_solution_file_request", "GetBasicSolutionFileRequest"),
        ("seed.v_2.problem.types.get_basic_solution_file_response", "GetBasicSolutionFileResponse"),
        ("seed.v_2.problem.types.get_function_signature_request", "GetFunctionSignatureRequest"),
        ("seed.v_2.problem.types.get_function_signature_response", "GetFunctionSignatureResponse"),
        ("seed.v_2.problem.types.get_generated_test_case_file_request", "GetGeneratedTestCaseFileRequest"),
        (
            "seed.v_2.problem.types.get_generated_test_case_template_file_request",
            "GetGeneratedTestCaseTemplateFileRequest",
        ),
        ("seed.v_2.problem.types.lightweight_problem_info_v_2", "LightweightProblemInfoV2"),
        ("seed.v_2.problem.types.non_void_function_definition", "NonVoidFunctionDefinition"),
        ("seed.v_2.problem.types.non_void_function_signature", "NonVoidFunctionSignature"),
        ("seed.v_2.problem.types.parameter", "Parameter"),
        ("seed.v_2.problem.types.parameter_id", "ParameterId"),
        ("seed.v_2.problem.types.problem_info_v_2", "ProblemInfoV2"),
        ("seed.v_2.problem.types.test_case_expects", "TestCaseExpects"),
        ("seed.v_2.problem.types.test_case_function", "TestCaseFunction"),
        ("seed.v_2.problem.types.test_case_id", "TestCaseId"),
        ("seed.v_2.problem.types.test_case_implementation", "TestCaseImplementation"),
        ("seed.v_2.problem.types.test_case_implementation_description", "TestCaseImplementationDescription"),
        ("seed.v_2.problem.types.test_case_implementation_description_board", "TestCaseImplementationDescriptionBoard"),
        ("seed.v_2.problem.types.test_case_implementation_reference", "TestCaseImplementationReference"),
        ("seed.v_2.problem.types.test_case_metadata", "TestCaseMetadata"),
        ("seed.v_2.problem.types.test_case_template", "TestCaseTemplate"),
        ("seed.v_2.problem.types.test_case_template_id", "TestCaseTemplateId"),
        ("seed.v_2.problem.types.test_case_v_2", "TestCaseV2"),
        (
            "seed.v_2.problem.types.test_case_with_actual_result_implementation",
            "TestCaseWithActualResultImplementation",
        ),
        ("seed.v_2.problem.types.void_function_definition", "VoidFunctionDefinition"),
        (
            "seed.v_2.problem.types.void_function_definition_that_takes_actual_result",
            "VoidFunctionDefinitionThatTakesActualResult",
        ),
        ("seed.v_2.problem.types.void_function_signature", "VoidFunctionSignature"),
        (
            "seed.v_2.problem.types.void_function_signature_that_takes_actual_result",
            "VoidFunctionSignatureThatTakesActualResult",
        ),
        ("seed.v_2.v_3.problem.types.assert_correctness_check", "AssertCorrectnessCheck"),
        ("seed.v_2.v_3.problem.types.basic_custom_files", "BasicCustomFiles"),
        ("seed.v_2.v_3.problem.types.basic_test_case_template", "BasicTestCaseTemplate"),
        ("seed.v_2.v_3.problem.types.create_problem_request_v_2", "CreateProblemRequestV2"),
        ("seed.v_2.v_3.problem.types.custom_files", "CustomFiles"),
        ("seed.v_2.v_3.problem.types.deep_equality_correctness_check", "DeepEqualityCorrectnessCheck"),
        ("seed.v_2.v_3.problem.types.default_provided_file", "DefaultProvidedFile"),
        ("seed.v_2.v_3.problem.types.file_info_v_2", "FileInfoV2"),
        ("seed.v_2.v_3.problem.types.files", "Files"),
        ("seed.v_2.v_3.problem.types.function_implementation", "FunctionImplementation"),
        (
            "seed.v_2.v_3.problem.types.function_implementation_for_multiple_languages",
            "FunctionImplementationForMultipleLanguages",
        ),
        ("seed.v_2.v_3.problem.types.function_signature", "FunctionSignature"),
        ("seed.v_2.v_3.problem.types.generated_files", "GeneratedFiles"),
        ("seed.v_2.v_3.problem.types.get_basic_solution_file_request", "GetBasicSolutionFileRequest"),
        ("seed.v_2.v_3.problem.types.get_basic_solution_file_response", "GetBasicSolutionFileResponse"),
        ("seed.v_2.v_3.problem.types.get_function_signature_request", "GetFunctionSignatureRequest"),
        ("seed.v_2.v_3.problem.types.get_function_signature_response", "GetFunctionSignatureResponse"),
        ("seed.v_2.v_3.problem.types.get_generated_test_case_file_request", "GetGeneratedTestCaseFileRequest"),
        (
            "seed.v_2.v_3.problem.types.get_generated_test_case_template_file_request",
            "GetGeneratedTestCaseTemplateFileRequest",
        ),
        ("seed.v_2.v_3.problem.types.lightweight_problem_info_v_2", "LightweightProblemInfoV2"),
        ("seed.v_2.v_3.problem.types.non_void_function_definition", "NonVoidFunctionDefinition"),
        ("seed.v_2.v_3.problem.types.non_void_function_signature", "NonVoidFunctionSignature"),
        ("seed.v_2.v_3.problem.types.parameter", "Parameter"),
        ("seed.v_2.v_3.problem.types.parameter_id", "ParameterId"),
        ("seed.v_2.v_3.problem.types.problem_info_v_2", "ProblemInfoV2"),
        ("seed.v_2.v_3.problem.types.test_case_expects", "TestCaseExpects"),
        ("seed.v_2.v_3.problem.types.test_case_function", "TestCaseFunction"),
        ("seed.v_2.v_3.problem.types.test_case_id", "TestCaseId"),
        ("seed.v_2.v_3.problem.types.test_case_implementation", "TestCaseImplementation"),
        ("seed.v_2.v_3.problem.types.test_case_implementation_description", "TestCaseImplementationDescription"),
        (
            "seed.v_2.v_3.problem.types.test_case_implementation_description_board",
            "TestCaseImplementationDescriptionBoard",
        ),
        ("seed.v_2.v_3.problem.types.test_case_implementation_reference", "TestCaseImplementationReference"),
        ("seed.v_2.v_3.problem.types.test_case_metadata", "TestCaseMetadata"),
        ("seed.v_2.v_3.problem.types.test_case_template", "TestCaseTemplate"),
        ("seed.v_2.v_3.problem.types.test_case_template_id", "TestCaseTemplateId"),
        ("seed.v_2.v_3.problem.types.test_case_v_2", "TestCaseV2"),
        (
            "seed.v_2.v_3.problem.types.test_case_with_actual_result_implementation",
            "TestCaseWithActualResultImplementation",
        ),
        ("seed.v_2.v_3.problem.types.void_function_definition", "VoidFunctionDefinition"),
        (
            "seed.v_2.v_3.problem.types.void_function_definition_that_takes_actual_result",
            "VoidFunctionDefinitionThatTakesActualResult",
        ),
        ("seed.v_2.v_3.problem.types.void_function_signature", "VoidFunctionSignature"),
        (
            "seed.v_2.v_3.problem.types.void_function_signature_that_takes_actual_result",
            "VoidFunctionSignatureThatTakesActualResult",
        ),
    ],
)
def test_type_can_be_imported_and_instantiated(module_name: str, class_name: str) -> None:
    """Test that a type can be imported and instantiated in a subprocess."""
    test_code = f"""
import sys
from pydantic import ValidationError as PydanticValidationError

try:
    from {module_name} import {class_name}

    try:
        {class_name}()
    except PydanticValidationError:
        pass
    except TypeError:
        pass
    except ValueError:
        pass

except ImportError as e:
    print("ImportError: " + str(e), file=sys.stderr)
    sys.exit(1)
except TypeError as e:
    pass
except BaseException as e:
    print(type(e).__name__ + ": " + str(e), file=sys.stderr)
    sys.exit(1)

sys.exit(0)
"""

    result = subprocess.run(
        [sys.executable, "-c", test_code],
        capture_output=True,
        text=True,
        timeout=30,
    )

    assert result.returncode == 0, f"Failed to import/instantiate {module_name}.{class_name}: {result.stderr}"
