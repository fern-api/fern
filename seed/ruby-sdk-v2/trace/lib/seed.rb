# frozen_string_literal: true

require "json"
require "net/http"
require "securerandom"

require_relative "seed/internal/json/serializable"
require_relative "seed/internal/types/type"
require_relative "seed/internal/types/utils"
require_relative "seed/internal/types/union"
require_relative "seed/internal/errors/constraint_error"
require_relative "seed/internal/errors/type_error"
require_relative "seed/internal/http/base_request"
require_relative "seed/internal/json/request"
require_relative "seed/internal/http/raw_client"
require_relative "seed/internal/multipart/multipart_encoder"
require_relative "seed/internal/multipart/multipart_form_data_part"
require_relative "seed/internal/multipart/multipart_form_data"
require_relative "seed/internal/multipart/multipart_request"
require_relative "seed/internal/types/model/field"
require_relative "seed/internal/types/model"
require_relative "seed/internal/types/array"
require_relative "seed/internal/types/boolean"
require_relative "seed/internal/types/enum"
require_relative "seed/internal/types/hash"
require_relative "seed/internal/types/unknown"
require_relative "seed/errors/api_error"
require_relative "seed/errors/response_error"
require_relative "seed/errors/client_error"
require_relative "seed/errors/redirect_error"
require_relative "seed/errors/server_error"
require_relative "seed/errors/timeout_error"
require_relative "seed/internal/iterators/item_iterator"
require_relative "seed/internal/iterators/cursor_item_iterator"
require_relative "seed/internal/iterators/offset_item_iterator"
require_relative "seed/internal/iterators/cursor_page_iterator"
require_relative "seed/internal/iterators/offset_page_iterator"
require_relative "seed/errors/connection_error"
require_relative "seed/client"
require_relative "seed/v2/client"
require_relative "seed/admin/client"
require_relative "seed/admin/types/store_traced_test_case_request"
require_relative "seed/admin/types/store_traced_workspace_request"
require_relative "seed/homepage/client"
require_relative "seed/migration/client"
require_relative "seed/migration/types/get_attempted_migrations_request"
require_relative "seed/playlist/client"
require_relative "seed/playlist/types/create_playlist_request"
require_relative "seed/playlist/types/get_playlists_request"
require_relative "seed/problem/client"
require_relative "seed/problem/types/get_default_starter_files_request"
require_relative "seed/submission/client"
require_relative "seed/sysprop/client"
require_relative "seed/v2/problem/client"
require_relative "seed/v2/v3/client"
require_relative "seed/v2/v3/problem/client"
require_relative "seed/environment"

module Seed
  module Admin
    module Types
      autoload :Test, ::File.join(__dir__, "seed/admin/types/test")
    end
  end

  module Commons
    module Types
      autoload :UserID, ::File.join(__dir__, "seed/commons/types/user_id")
      autoload :ProblemID, ::File.join(__dir__, "seed/commons/types/problem_id")
      autoload :NodeID, ::File.join(__dir__, "seed/commons/types/node_id")
      autoload :MapType, ::File.join(__dir__, "seed/commons/types/map_type")
      autoload :ListType, ::File.join(__dir__, "seed/commons/types/list_type")
      autoload :VariableType, ::File.join(__dir__, "seed/commons/types/variable_type")
      autoload :BinaryTreeNodeValue, ::File.join(__dir__, "seed/commons/types/binary_tree_node_value")
      autoload :BinaryTreeValue, ::File.join(__dir__, "seed/commons/types/binary_tree_value")
      autoload :SinglyLinkedListNodeValue, ::File.join(__dir__, "seed/commons/types/singly_linked_list_node_value")
      autoload :SinglyLinkedListValue, ::File.join(__dir__, "seed/commons/types/singly_linked_list_value")
      autoload :DoublyLinkedListNodeValue, ::File.join(__dir__, "seed/commons/types/doubly_linked_list_node_value")
      autoload :DoublyLinkedListValue, ::File.join(__dir__, "seed/commons/types/doubly_linked_list_value")
      autoload :KeyValuePair, ::File.join(__dir__, "seed/commons/types/key_value_pair")
      autoload :MapValue, ::File.join(__dir__, "seed/commons/types/map_value")
      autoload :VariableValue, ::File.join(__dir__, "seed/commons/types/variable_value")
      autoload :GenericValue, ::File.join(__dir__, "seed/commons/types/generic_value")
      autoload :BinaryTreeNodeAndTreeValue, ::File.join(__dir__, "seed/commons/types/binary_tree_node_and_tree_value")
      autoload :SinglyLinkedListNodeAndListValue, ::File.join(__dir__, "seed/commons/types/singly_linked_list_node_and_list_value")
      autoload :DoublyLinkedListNodeAndListValue, ::File.join(__dir__, "seed/commons/types/doubly_linked_list_node_and_list_value")
      autoload :DebugKeyValuePairs, ::File.join(__dir__, "seed/commons/types/debug_key_value_pairs")
      autoload :DebugMapValue, ::File.join(__dir__, "seed/commons/types/debug_map_value")
      autoload :DebugVariableValue, ::File.join(__dir__, "seed/commons/types/debug_variable_value")
      autoload :TestCase, ::File.join(__dir__, "seed/commons/types/test_case")
      autoload :TestCaseWithExpectedResult, ::File.join(__dir__, "seed/commons/types/test_case_with_expected_result")
      autoload :FileInfo, ::File.join(__dir__, "seed/commons/types/file_info")
      autoload :Language, ::File.join(__dir__, "seed/commons/types/language")
    end
  end

  module LangServer
    module Types
      autoload :LangServerRequest, ::File.join(__dir__, "seed/lang_server/types/lang_server_request")
      autoload :LangServerResponse, ::File.join(__dir__, "seed/lang_server/types/lang_server_response")
    end
  end

  module Migration
    module Types
      autoload :MigrationStatus, ::File.join(__dir__, "seed/migration/types/migration_status")
      autoload :Migration, ::File.join(__dir__, "seed/migration/types/migration")
    end
  end

  module Playlist
    module Types
      autoload :PlaylistID, ::File.join(__dir__, "seed/playlist/types/playlist_id")
      autoload :PlaylistCreateRequest, ::File.join(__dir__, "seed/playlist/types/playlist_create_request")
      autoload :Playlist, ::File.join(__dir__, "seed/playlist/types/playlist")
      autoload :UpdatePlaylistRequest, ::File.join(__dir__, "seed/playlist/types/update_playlist_request")
      autoload :PlaylistIDNotFoundErrorBody, ::File.join(__dir__, "seed/playlist/types/playlist_id_not_found_error_body")
      autoload :ReservedKeywordEnum, ::File.join(__dir__, "seed/playlist/types/reserved_keyword_enum")
    end
  end

  module Problem
    module Types
      autoload :ProblemDescriptionBoard, ::File.join(__dir__, "seed/problem/types/problem_description_board")
      autoload :ProblemDescription, ::File.join(__dir__, "seed/problem/types/problem_description")
      autoload :ProblemFiles, ::File.join(__dir__, "seed/problem/types/problem_files")
      autoload :VariableTypeAndName, ::File.join(__dir__, "seed/problem/types/variable_type_and_name")
      autoload :ProblemInfo, ::File.join(__dir__, "seed/problem/types/problem_info")
      autoload :CreateProblemRequest, ::File.join(__dir__, "seed/problem/types/create_problem_request")
      autoload :GenericCreateProblemError, ::File.join(__dir__, "seed/problem/types/generic_create_problem_error")
      autoload :CreateProblemError, ::File.join(__dir__, "seed/problem/types/create_problem_error")
      autoload :CreateProblemResponse, ::File.join(__dir__, "seed/problem/types/create_problem_response")
      autoload :UpdateProblemResponse, ::File.join(__dir__, "seed/problem/types/update_problem_response")
      autoload :GetDefaultStarterFilesResponse, ::File.join(__dir__, "seed/problem/types/get_default_starter_files_response")
    end
  end

  module Submission
    module Types
      autoload :SubmissionID, ::File.join(__dir__, "seed/submission/types/submission_id")
      autoload :ShareID, ::File.join(__dir__, "seed/submission/types/share_id")
      autoload :InitializeProblemRequest, ::File.join(__dir__, "seed/submission/types/initialize_problem_request")
      autoload :SubmissionFileInfo, ::File.join(__dir__, "seed/submission/types/submission_file_info")
      autoload :SubmitRequestV2, ::File.join(__dir__, "seed/submission/types/submit_request_v2")
      autoload :WorkspaceSubmitRequest, ::File.join(__dir__, "seed/submission/types/workspace_submit_request")
      autoload :StopRequest, ::File.join(__dir__, "seed/submission/types/stop_request")
      autoload :SubmissionRequest, ::File.join(__dir__, "seed/submission/types/submission_request")
      autoload :SubmissionTypeEnum, ::File.join(__dir__, "seed/submission/types/submission_type_enum")
      autoload :ExecutionSessionStatus, ::File.join(__dir__, "seed/submission/types/execution_session_status")
      autoload :BuildingExecutorResponse, ::File.join(__dir__, "seed/submission/types/building_executor_response")
      autoload :RunningSubmissionState, ::File.join(__dir__, "seed/submission/types/running_submission_state")
      autoload :RunningResponse, ::File.join(__dir__, "seed/submission/types/running_response")
      autoload :CompileError, ::File.join(__dir__, "seed/submission/types/compile_error")
      autoload :RuntimeError, ::File.join(__dir__, "seed/submission/types/runtime_error")
      autoload :ExceptionInfo, ::File.join(__dir__, "seed/submission/types/exception_info")
      autoload :InternalError, ::File.join(__dir__, "seed/submission/types/internal_error")
      autoload :ErrorInfo, ::File.join(__dir__, "seed/submission/types/error_info")
      autoload :ErroredResponse, ::File.join(__dir__, "seed/submission/types/errored_response")
      autoload :StoppedResponse, ::File.join(__dir__, "seed/submission/types/stopped_response")
      autoload :ExceptionV2, ::File.join(__dir__, "seed/submission/types/exception_v2")
      autoload :WorkspaceRunDetails, ::File.join(__dir__, "seed/submission/types/workspace_run_details")
      autoload :WorkspaceRanResponse, ::File.join(__dir__, "seed/submission/types/workspace_ran_response")
      autoload :ActualResult, ::File.join(__dir__, "seed/submission/types/actual_result")
      autoload :TestCaseResult, ::File.join(__dir__, "seed/submission/types/test_case_result")
      autoload :TestCaseResultWithStdout, ::File.join(__dir__, "seed/submission/types/test_case_result_with_stdout")
      autoload :GradedResponse, ::File.join(__dir__, "seed/submission/types/graded_response")
      autoload :TestCaseHiddenGrade, ::File.join(__dir__, "seed/submission/types/test_case_hidden_grade")
      autoload :TestCaseNonHiddenGrade, ::File.join(__dir__, "seed/submission/types/test_case_non_hidden_grade")
      autoload :TestCaseGrade, ::File.join(__dir__, "seed/submission/types/test_case_grade")
      autoload :GradedResponseV2, ::File.join(__dir__, "seed/submission/types/graded_response_v2")
      autoload :RecordedResponseNotification, ::File.join(__dir__, "seed/submission/types/recorded_response_notification")
      autoload :LightweightStackframeInformation, ::File.join(__dir__, "seed/submission/types/lightweight_stackframe_information")
      autoload :TracedFile, ::File.join(__dir__, "seed/submission/types/traced_file")
      autoload :RecordingResponseNotification, ::File.join(__dir__, "seed/submission/types/recording_response_notification")
      autoload :SubmissionIDNotFound, ::File.join(__dir__, "seed/submission/types/submission_id_not_found")
      autoload :CustomTestCasesUnsupported, ::File.join(__dir__, "seed/submission/types/custom_test_cases_unsupported")
      autoload :UnexpectedLanguageError, ::File.join(__dir__, "seed/submission/types/unexpected_language_error")
      autoload :InvalidRequestCause, ::File.join(__dir__, "seed/submission/types/invalid_request_cause")
      autoload :InvalidRequestResponse, ::File.join(__dir__, "seed/submission/types/invalid_request_response")
      autoload :FinishedResponse, ::File.join(__dir__, "seed/submission/types/finished_response")
      autoload :CodeExecutionUpdate, ::File.join(__dir__, "seed/submission/types/code_execution_update")
      autoload :TerminatedResponse, ::File.join(__dir__, "seed/submission/types/terminated_response")
      autoload :SubmissionResponse, ::File.join(__dir__, "seed/submission/types/submission_response")
      autoload :ExistingSubmissionExecuting, ::File.join(__dir__, "seed/submission/types/existing_submission_executing")
      autoload :StdoutResponse, ::File.join(__dir__, "seed/submission/types/stdout_response")
      autoload :StderrResponse, ::File.join(__dir__, "seed/submission/types/stderr_response")
      autoload :ExpressionLocation, ::File.join(__dir__, "seed/submission/types/expression_location")
      autoload :Scope, ::File.join(__dir__, "seed/submission/types/scope")
      autoload :StackFrame, ::File.join(__dir__, "seed/submission/types/stack_frame")
      autoload :StackInformation, ::File.join(__dir__, "seed/submission/types/stack_information")
      autoload :TraceResponse, ::File.join(__dir__, "seed/submission/types/trace_response")
      autoload :TraceResponseV2, ::File.join(__dir__, "seed/submission/types/trace_response_v2")
      autoload :ExecutionSessionResponse, ::File.join(__dir__, "seed/submission/types/execution_session_response")
      autoload :GradedTestCaseUpdate, ::File.join(__dir__, "seed/submission/types/graded_test_case_update")
      autoload :RecordedTestCaseUpdate, ::File.join(__dir__, "seed/submission/types/recorded_test_case_update")
      autoload :TestSubmissionUpdateInfo, ::File.join(__dir__, "seed/submission/types/test_submission_update_info")
      autoload :TestSubmissionUpdate, ::File.join(__dir__, "seed/submission/types/test_submission_update")
      autoload :TestSubmissionStatusV2, ::File.join(__dir__, "seed/submission/types/test_submission_status_v2")
      autoload :WorkspaceTracedUpdate, ::File.join(__dir__, "seed/submission/types/workspace_traced_update")
      autoload :WorkspaceSubmissionUpdateInfo, ::File.join(__dir__, "seed/submission/types/workspace_submission_update_info")
      autoload :WorkspaceSubmissionUpdate, ::File.join(__dir__, "seed/submission/types/workspace_submission_update")
      autoload :WorkspaceSubmissionStatusV2, ::File.join(__dir__, "seed/submission/types/workspace_submission_status_v2")
      autoload :SubmissionStatusV2, ::File.join(__dir__, "seed/submission/types/submission_status_v2")
      autoload :WorkspaceSubmissionStatus, ::File.join(__dir__, "seed/submission/types/workspace_submission_status")
      autoload :WorkspaceSubmissionState, ::File.join(__dir__, "seed/submission/types/workspace_submission_state")
      autoload :TracedTestCase, ::File.join(__dir__, "seed/submission/types/traced_test_case")
      autoload :SubmissionStatusForTestCase, ::File.join(__dir__, "seed/submission/types/submission_status_for_test_case")
      autoload :TestSubmissionStatus, ::File.join(__dir__, "seed/submission/types/test_submission_status")
      autoload :TestSubmissionState, ::File.join(__dir__, "seed/submission/types/test_submission_state")
      autoload :SubmissionTypeState, ::File.join(__dir__, "seed/submission/types/submission_type_state")
      autoload :TraceResponsesPage, ::File.join(__dir__, "seed/submission/types/trace_responses_page")
      autoload :TraceResponsesPageV2, ::File.join(__dir__, "seed/submission/types/trace_responses_page_v2")
      autoload :GetTraceResponsesPageRequest, ::File.join(__dir__, "seed/submission/types/get_trace_responses_page_request")
      autoload :WorkspaceFiles, ::File.join(__dir__, "seed/submission/types/workspace_files")
      autoload :WorkspaceStarterFilesResponse, ::File.join(__dir__, "seed/submission/types/workspace_starter_files_response")
      autoload :WorkspaceStarterFilesResponseV2, ::File.join(__dir__, "seed/submission/types/workspace_starter_files_response_v2")
      autoload :ExecutionSessionState, ::File.join(__dir__, "seed/submission/types/execution_session_state")
      autoload :GetExecutionSessionStateResponse, ::File.join(__dir__, "seed/submission/types/get_execution_session_state_response")
      autoload :GetSubmissionStateResponse, ::File.join(__dir__, "seed/submission/types/get_submission_state_response")
    end
  end

  module V2
    module Problem
      module Types
        autoload :TestCaseID, ::File.join(__dir__, "seed/v2/problem/types/test_case_id")
        autoload :TestCaseTemplateID, ::File.join(__dir__, "seed/v2/problem/types/test_case_template_id")
        autoload :ParameterID, ::File.join(__dir__, "seed/v2/problem/types/parameter_id")
        autoload :TestCaseExpects, ::File.join(__dir__, "seed/v2/problem/types/test_case_expects")
        autoload :Parameter, ::File.join(__dir__, "seed/v2/problem/types/parameter")
        autoload :NonVoidFunctionSignature, ::File.join(__dir__, "seed/v2/problem/types/non_void_function_signature")
        autoload :FunctionImplementation, ::File.join(__dir__, "seed/v2/problem/types/function_implementation")
        autoload :FunctionImplementationForMultipleLanguages, ::File.join(__dir__, "seed/v2/problem/types/function_implementation_for_multiple_languages")
        autoload :NonVoidFunctionDefinition, ::File.join(__dir__, "seed/v2/problem/types/non_void_function_definition")
        autoload :DeepEqualityCorrectnessCheck, ::File.join(__dir__, "seed/v2/problem/types/deep_equality_correctness_check")
        autoload :VoidFunctionDefinitionThatTakesActualResult, ::File.join(__dir__, "seed/v2/problem/types/void_function_definition_that_takes_actual_result")
        autoload :AssertCorrectnessCheck, ::File.join(__dir__, "seed/v2/problem/types/assert_correctness_check")
        autoload :TestCaseWithActualResultImplementation, ::File.join(__dir__, "seed/v2/problem/types/test_case_with_actual_result_implementation")
        autoload :VoidFunctionDefinition, ::File.join(__dir__, "seed/v2/problem/types/void_function_definition")
        autoload :TestCaseFunction, ::File.join(__dir__, "seed/v2/problem/types/test_case_function")
        autoload :TestCaseImplementationDescriptionBoard, ::File.join(__dir__, "seed/v2/problem/types/test_case_implementation_description_board")
        autoload :TestCaseImplementationDescription, ::File.join(__dir__, "seed/v2/problem/types/test_case_implementation_description")
        autoload :TestCaseImplementation, ::File.join(__dir__, "seed/v2/problem/types/test_case_implementation")
        autoload :TestCaseImplementationReference, ::File.join(__dir__, "seed/v2/problem/types/test_case_implementation_reference")
        autoload :TestCaseMetadata, ::File.join(__dir__, "seed/v2/problem/types/test_case_metadata")
        autoload :TestCaseV2, ::File.join(__dir__, "seed/v2/problem/types/test_case_v2")
        autoload :BasicTestCaseTemplate, ::File.join(__dir__, "seed/v2/problem/types/basic_test_case_template")
        autoload :TestCaseTemplate, ::File.join(__dir__, "seed/v2/problem/types/test_case_template")
        autoload :FileInfoV2, ::File.join(__dir__, "seed/v2/problem/types/file_info_v2")
        autoload :Files, ::File.join(__dir__, "seed/v2/problem/types/files")
        autoload :GeneratedFiles, ::File.join(__dir__, "seed/v2/problem/types/generated_files")
        autoload :BasicCustomFiles, ::File.join(__dir__, "seed/v2/problem/types/basic_custom_files")
        autoload :CustomFiles, ::File.join(__dir__, "seed/v2/problem/types/custom_files")
        autoload :ProblemInfoV2, ::File.join(__dir__, "seed/v2/problem/types/problem_info_v2")
        autoload :LightweightProblemInfoV2, ::File.join(__dir__, "seed/v2/problem/types/lightweight_problem_info_v2")
        autoload :CreateProblemRequestV2, ::File.join(__dir__, "seed/v2/problem/types/create_problem_request_v2")
        autoload :VoidFunctionSignature, ::File.join(__dir__, "seed/v2/problem/types/void_function_signature")
        autoload :VoidFunctionSignatureThatTakesActualResult, ::File.join(__dir__, "seed/v2/problem/types/void_function_signature_that_takes_actual_result")
        autoload :DefaultProvidedFile, ::File.join(__dir__, "seed/v2/problem/types/default_provided_file")
        autoload :FunctionSignature, ::File.join(__dir__, "seed/v2/problem/types/function_signature")
        autoload :GetFunctionSignatureRequest, ::File.join(__dir__, "seed/v2/problem/types/get_function_signature_request")
        autoload :GetFunctionSignatureResponse, ::File.join(__dir__, "seed/v2/problem/types/get_function_signature_response")
        autoload :GetBasicSolutionFileRequest, ::File.join(__dir__, "seed/v2/problem/types/get_basic_solution_file_request")
        autoload :GetBasicSolutionFileResponse, ::File.join(__dir__, "seed/v2/problem/types/get_basic_solution_file_response")
        autoload :GetGeneratedTestCaseFileRequest, ::File.join(__dir__, "seed/v2/problem/types/get_generated_test_case_file_request")
        autoload :GetGeneratedTestCaseTemplateFileRequest, ::File.join(__dir__, "seed/v2/problem/types/get_generated_test_case_template_file_request")
      end
    end

    module V3
      module Problem
        module Types
          autoload :TestCaseTemplateID, ::File.join(__dir__, "seed/v2/v3/problem/types/test_case_template_id")
          autoload :TestCaseID, ::File.join(__dir__, "seed/v2/v3/problem/types/test_case_id")
          autoload :ParameterID, ::File.join(__dir__, "seed/v2/v3/problem/types/parameter_id")
          autoload :TestCaseExpects, ::File.join(__dir__, "seed/v2/v3/problem/types/test_case_expects")
          autoload :Parameter, ::File.join(__dir__, "seed/v2/v3/problem/types/parameter")
          autoload :NonVoidFunctionSignature, ::File.join(__dir__, "seed/v2/v3/problem/types/non_void_function_signature")
          autoload :FunctionImplementation, ::File.join(__dir__, "seed/v2/v3/problem/types/function_implementation")
          autoload :FunctionImplementationForMultipleLanguages, ::File.join(__dir__, "seed/v2/v3/problem/types/function_implementation_for_multiple_languages")
          autoload :NonVoidFunctionDefinition, ::File.join(__dir__, "seed/v2/v3/problem/types/non_void_function_definition")
          autoload :DeepEqualityCorrectnessCheck, ::File.join(__dir__, "seed/v2/v3/problem/types/deep_equality_correctness_check")
          autoload :VoidFunctionDefinitionThatTakesActualResult, ::File.join(__dir__, "seed/v2/v3/problem/types/void_function_definition_that_takes_actual_result")
          autoload :AssertCorrectnessCheck, ::File.join(__dir__, "seed/v2/v3/problem/types/assert_correctness_check")
          autoload :TestCaseWithActualResultImplementation, ::File.join(__dir__, "seed/v2/v3/problem/types/test_case_with_actual_result_implementation")
          autoload :VoidFunctionDefinition, ::File.join(__dir__, "seed/v2/v3/problem/types/void_function_definition")
          autoload :TestCaseFunction, ::File.join(__dir__, "seed/v2/v3/problem/types/test_case_function")
          autoload :TestCaseImplementationDescriptionBoard, ::File.join(__dir__, "seed/v2/v3/problem/types/test_case_implementation_description_board")
          autoload :TestCaseImplementationDescription, ::File.join(__dir__, "seed/v2/v3/problem/types/test_case_implementation_description")
          autoload :TestCaseImplementation, ::File.join(__dir__, "seed/v2/v3/problem/types/test_case_implementation")
          autoload :TestCaseImplementationReference, ::File.join(__dir__, "seed/v2/v3/problem/types/test_case_implementation_reference")
          autoload :TestCaseMetadata, ::File.join(__dir__, "seed/v2/v3/problem/types/test_case_metadata")
          autoload :TestCaseV2, ::File.join(__dir__, "seed/v2/v3/problem/types/test_case_v2")
          autoload :BasicTestCaseTemplate, ::File.join(__dir__, "seed/v2/v3/problem/types/basic_test_case_template")
          autoload :TestCaseTemplate, ::File.join(__dir__, "seed/v2/v3/problem/types/test_case_template")
          autoload :FileInfoV2, ::File.join(__dir__, "seed/v2/v3/problem/types/file_info_v2")
          autoload :Files, ::File.join(__dir__, "seed/v2/v3/problem/types/files")
          autoload :GeneratedFiles, ::File.join(__dir__, "seed/v2/v3/problem/types/generated_files")
          autoload :BasicCustomFiles, ::File.join(__dir__, "seed/v2/v3/problem/types/basic_custom_files")
          autoload :CustomFiles, ::File.join(__dir__, "seed/v2/v3/problem/types/custom_files")
          autoload :ProblemInfoV2, ::File.join(__dir__, "seed/v2/v3/problem/types/problem_info_v2")
          autoload :LightweightProblemInfoV2, ::File.join(__dir__, "seed/v2/v3/problem/types/lightweight_problem_info_v2")
          autoload :CreateProblemRequestV2, ::File.join(__dir__, "seed/v2/v3/problem/types/create_problem_request_v2")
          autoload :VoidFunctionSignature, ::File.join(__dir__, "seed/v2/v3/problem/types/void_function_signature")
          autoload :VoidFunctionSignatureThatTakesActualResult, ::File.join(__dir__, "seed/v2/v3/problem/types/void_function_signature_that_takes_actual_result")
          autoload :DefaultProvidedFile, ::File.join(__dir__, "seed/v2/v3/problem/types/default_provided_file")
          autoload :FunctionSignature, ::File.join(__dir__, "seed/v2/v3/problem/types/function_signature")
          autoload :GetFunctionSignatureRequest, ::File.join(__dir__, "seed/v2/v3/problem/types/get_function_signature_request")
          autoload :GetFunctionSignatureResponse, ::File.join(__dir__, "seed/v2/v3/problem/types/get_function_signature_response")
          autoload :GetBasicSolutionFileRequest, ::File.join(__dir__, "seed/v2/v3/problem/types/get_basic_solution_file_request")
          autoload :GetBasicSolutionFileResponse, ::File.join(__dir__, "seed/v2/v3/problem/types/get_basic_solution_file_response")
          autoload :GetGeneratedTestCaseFileRequest, ::File.join(__dir__, "seed/v2/v3/problem/types/get_generated_test_case_file_request")
          autoload :GetGeneratedTestCaseTemplateFileRequest, ::File.join(__dir__, "seed/v2/v3/problem/types/get_generated_test_case_template_file_request")
        end
      end
    end
  end
end
