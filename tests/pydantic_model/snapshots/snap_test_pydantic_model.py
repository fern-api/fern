# -*- coding: utf-8 -*-
# snapshottest: v1 - https://goo.gl/zC4yUc
from __future__ import unicode_literals

from snapshottest import Snapshot
from snapshottest.file import FileSnapshot


snapshots = Snapshot()

snapshots['test_pydantic_model __init__'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model __init__.py')

snapshots['test_pydantic_model admin___init__'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model admin___init__.py')

snapshots['test_pydantic_model admin_store_traced_test_case_request'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model admin_store_traced_test_case_request.py')

snapshots['test_pydantic_model admin_store_traced_workspace_request'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model admin_store_traced_workspace_request.py')

snapshots['test_pydantic_model commons___init__'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model commons___init__.py')

snapshots['test_pydantic_model commons_binary_tree_node_and_tree_value'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model commons_binary_tree_node_and_tree_value.py')

snapshots['test_pydantic_model commons_binary_tree_node_value'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model commons_binary_tree_node_value.py')

snapshots['test_pydantic_model commons_binary_tree_value'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model commons_binary_tree_value.py')

snapshots['test_pydantic_model commons_debug_key_value_pairs'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model commons_debug_key_value_pairs.py')

snapshots['test_pydantic_model commons_debug_map_value'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model commons_debug_map_value.py')

snapshots['test_pydantic_model commons_debug_variable_value'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model commons_debug_variable_value.py')

snapshots['test_pydantic_model commons_doubly_linked_list_node_and_list_value'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model commons_doubly_linked_list_node_and_list_value.py')

snapshots['test_pydantic_model commons_doubly_linked_list_node_value'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model commons_doubly_linked_list_node_value.py')

snapshots['test_pydantic_model commons_doubly_linked_list_value'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model commons_doubly_linked_list_value.py')

snapshots['test_pydantic_model commons_file_info'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model commons_file_info.py')

snapshots['test_pydantic_model commons_generic_value'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model commons_generic_value.py')

snapshots['test_pydantic_model commons_key_value_pair'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model commons_key_value_pair.py')

snapshots['test_pydantic_model commons_language'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model commons_language.py')

snapshots['test_pydantic_model commons_list_type'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model commons_list_type.py')

snapshots['test_pydantic_model commons_map_type'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model commons_map_type.py')

snapshots['test_pydantic_model commons_map_value'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model commons_map_value.py')

snapshots['test_pydantic_model commons_node_id'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model commons_node_id.py')

snapshots['test_pydantic_model commons_problem_id'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model commons_problem_id.py')

snapshots['test_pydantic_model commons_singly_linked_list_node_and_list_value'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model commons_singly_linked_list_node_and_list_value.py')

snapshots['test_pydantic_model commons_singly_linked_list_node_value'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model commons_singly_linked_list_node_value.py')

snapshots['test_pydantic_model commons_singly_linked_list_value'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model commons_singly_linked_list_value.py')

snapshots['test_pydantic_model commons_test_case'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model commons_test_case.py')

snapshots['test_pydantic_model commons_test_case_with_expected_result'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model commons_test_case_with_expected_result.py')

snapshots['test_pydantic_model commons_user_id'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model commons_user_id.py')

snapshots['test_pydantic_model commons_variable_type'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model commons_variable_type.py')

snapshots['test_pydantic_model commons_variable_value'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model commons_variable_value.py')

snapshots['test_pydantic_model filepaths'] = [
    '__init__.py',
    'admin/__init__.py',
    'admin/store_traced_test_case_request.py',
    'admin/store_traced_workspace_request.py',
    'commons/__init__.py',
    'commons/binary_tree_node_and_tree_value.py',
    'commons/binary_tree_node_value.py',
    'commons/binary_tree_value.py',
    'commons/debug_key_value_pairs.py',
    'commons/debug_map_value.py',
    'commons/debug_variable_value.py',
    'commons/doubly_linked_list_node_and_list_value.py',
    'commons/doubly_linked_list_node_value.py',
    'commons/doubly_linked_list_value.py',
    'commons/file_info.py',
    'commons/generic_value.py',
    'commons/key_value_pair.py',
    'commons/language.py',
    'commons/list_type.py',
    'commons/map_type.py',
    'commons/map_value.py',
    'commons/node_id.py',
    'commons/problem_id.py',
    'commons/singly_linked_list_node_and_list_value.py',
    'commons/singly_linked_list_node_value.py',
    'commons/singly_linked_list_value.py',
    'commons/test_case.py',
    'commons/test_case_with_expected_result.py',
    'commons/user_id.py',
    'commons/variable_type.py',
    'commons/variable_value.py',
    'lang_server/__init__.py',
    'lang_server/lang_server_request.py',
    'lang_server/lang_server_response.py',
    'migration/__init__.py',
    'migration/migration.py',
    'migration/migration_status.py',
    'playlist/__init__.py',
    'playlist/playlist.py',
    'playlist/playlist_create_request.py',
    'playlist/playlist_id.py',
    'playlist/update_playlist_request.py',
    'problem/__init__.py',
    'problem/create_problem_error.py',
    'problem/create_problem_request.py',
    'problem/create_problem_response.py',
    'problem/generic_create_problem_error.py',
    'problem/get_default_starter_files_request.py',
    'problem/get_default_starter_files_response.py',
    'problem/problem_description.py',
    'problem/problem_description_board.py',
    'problem/problem_files.py',
    'problem/problem_info.py',
    'problem/update_problem_response.py',
    'problem/variable_type_and_name.py',
    'submission/__init__.py',
    'submission/actual_result.py',
    'submission/building_executor_response.py',
    'submission/code_execution_update.py',
    'submission/compile_error.py',
    'submission/custom_test_cases_unsupported.py',
    'submission/error_info.py',
    'submission/errored_response.py',
    'submission/exception_info.py',
    'submission/exception_v_2.py',
    'submission/execution_session_response.py',
    'submission/execution_session_state.py',
    'submission/execution_session_status.py',
    'submission/existing_submission_executing.py',
    'submission/expression_location.py',
    'submission/finished_response.py',
    'submission/get_execution_session_state_response.py',
    'submission/get_submission_state_response.py',
    'submission/get_trace_responses_page_request.py',
    'submission/graded_response.py',
    'submission/graded_response_v_2.py',
    'submission/graded_test_case_update.py',
    'submission/initialize_problem_request.py',
    'submission/internal_error.py',
    'submission/invalid_request_cause.py',
    'submission/invalid_request_response.py',
    'submission/lightweight_stackframe_information.py',
    'submission/recorded_response_notification.py',
    'submission/recorded_test_case_update.py',
    'submission/recording_response_notification.py',
    'submission/running_response.py',
    'submission/running_submission_state.py',
    'submission/runtime_error.py',
    'submission/scope.py',
    'submission/share_id.py',
    'submission/stack_frame.py',
    'submission/stack_information.py',
    'submission/stderr_response.py',
    'submission/stdout_response.py',
    'submission/stop_request.py',
    'submission/stopped_response.py',
    'submission/submission_file_info.py',
    'submission/submission_id.py',
    'submission/submission_id_not_found.py',
    'submission/submission_request.py',
    'submission/submission_response.py',
    'submission/submission_status_for_test_case.py',
    'submission/submission_status_v_2.py',
    'submission/submission_type_enum.py',
    'submission/submission_type_state.py',
    'submission/submit_request_v_2.py',
    'submission/terminated_response.py',
    'submission/test_case_grade.py',
    'submission/test_case_hidden_grade.py',
    'submission/test_case_non_hidden_grade.py',
    'submission/test_case_result.py',
    'submission/test_case_result_with_stdout.py',
    'submission/test_submission_state.py',
    'submission/test_submission_status.py',
    'submission/test_submission_status_v_2.py',
    'submission/test_submission_update.py',
    'submission/test_submission_update_info.py',
    'submission/trace_response.py',
    'submission/trace_response_v_2.py',
    'submission/trace_responses_page.py',
    'submission/trace_responses_page_v_2.py',
    'submission/traced_file.py',
    'submission/traced_test_case.py',
    'submission/unexpected_language_error.py',
    'submission/workspace_files.py',
    'submission/workspace_ran_response.py',
    'submission/workspace_run_details.py',
    'submission/workspace_starter_files_response.py',
    'submission/workspace_starter_files_response_v_2.py',
    'submission/workspace_submission_state.py',
    'submission/workspace_submission_status.py',
    'submission/workspace_submission_status_v_2.py',
    'submission/workspace_submission_update.py',
    'submission/workspace_submission_update_info.py',
    'submission/workspace_submit_request.py',
    'submission/workspace_traced_update.py',
    'v_2/__init__.py',
    'v_2/problem/__init__.py',
    'v_2/problem/assert_correctness_check.py',
    'v_2/problem/basic_custom_files.py',
    'v_2/problem/basic_test_case_template.py',
    'v_2/problem/create_problem_request_v_2.py',
    'v_2/problem/custom_files.py',
    'v_2/problem/deep_equality_correctness_check.py',
    'v_2/problem/default_provided_file.py',
    'v_2/problem/file_info_v_2.py',
    'v_2/problem/files.py',
    'v_2/problem/function_implementation.py',
    'v_2/problem/function_implementation_for_multiple_languages.py',
    'v_2/problem/function_signature.py',
    'v_2/problem/generated_files.py',
    'v_2/problem/get_basic_solution_file_request.py',
    'v_2/problem/get_basic_solution_file_response.py',
    'v_2/problem/get_function_signature_request.py',
    'v_2/problem/get_function_signature_response.py',
    'v_2/problem/get_generated_test_case_file_request.py',
    'v_2/problem/get_generated_test_case_template_file_request.py',
    'v_2/problem/lightweight_problem_info_v_2.py',
    'v_2/problem/non_void_function_definition.py',
    'v_2/problem/non_void_function_signature.py',
    'v_2/problem/parameter.py',
    'v_2/problem/parameter_id.py',
    'v_2/problem/problem_info_v_2.py',
    'v_2/problem/test_case_expects.py',
    'v_2/problem/test_case_function.py',
    'v_2/problem/test_case_id.py',
    'v_2/problem/test_case_implementation.py',
    'v_2/problem/test_case_implementation_description.py',
    'v_2/problem/test_case_implementation_description_board.py',
    'v_2/problem/test_case_implementation_reference.py',
    'v_2/problem/test_case_metadata.py',
    'v_2/problem/test_case_template.py',
    'v_2/problem/test_case_template_id.py',
    'v_2/problem/test_case_v_2.py',
    'v_2/problem/test_case_with_actual_result_implementation.py',
    'v_2/problem/void_function_definition.py',
    'v_2/problem/void_function_definition_that_takes_actual_result.py',
    'v_2/problem/void_function_signature.py',
    'v_2/problem/void_function_signature_that_takes_actual_result.py',
    'v_2/v_3/__init__.py',
    'v_2/v_3/problem/__init__.py',
    'v_2/v_3/problem/assert_correctness_check.py',
    'v_2/v_3/problem/basic_custom_files.py',
    'v_2/v_3/problem/basic_test_case_template.py',
    'v_2/v_3/problem/create_problem_request_v_2.py',
    'v_2/v_3/problem/custom_files.py',
    'v_2/v_3/problem/deep_equality_correctness_check.py',
    'v_2/v_3/problem/default_provided_file.py',
    'v_2/v_3/problem/file_info_v_2.py',
    'v_2/v_3/problem/files.py',
    'v_2/v_3/problem/function_implementation.py',
    'v_2/v_3/problem/function_implementation_for_multiple_languages.py',
    'v_2/v_3/problem/function_signature.py',
    'v_2/v_3/problem/generated_files.py',
    'v_2/v_3/problem/get_basic_solution_file_request.py',
    'v_2/v_3/problem/get_basic_solution_file_response.py',
    'v_2/v_3/problem/get_function_signature_request.py',
    'v_2/v_3/problem/get_function_signature_response.py',
    'v_2/v_3/problem/get_generated_test_case_file_request.py',
    'v_2/v_3/problem/get_generated_test_case_template_file_request.py',
    'v_2/v_3/problem/lightweight_problem_info_v_2.py',
    'v_2/v_3/problem/non_void_function_definition.py',
    'v_2/v_3/problem/non_void_function_signature.py',
    'v_2/v_3/problem/parameter.py',
    'v_2/v_3/problem/parameter_id.py',
    'v_2/v_3/problem/problem_info_v_2.py',
    'v_2/v_3/problem/test_case_expects.py',
    'v_2/v_3/problem/test_case_function.py',
    'v_2/v_3/problem/test_case_id.py',
    'v_2/v_3/problem/test_case_implementation.py',
    'v_2/v_3/problem/test_case_implementation_description.py',
    'v_2/v_3/problem/test_case_implementation_description_board.py',
    'v_2/v_3/problem/test_case_implementation_reference.py',
    'v_2/v_3/problem/test_case_metadata.py',
    'v_2/v_3/problem/test_case_template.py',
    'v_2/v_3/problem/test_case_template_id.py',
    'v_2/v_3/problem/test_case_v_2.py',
    'v_2/v_3/problem/test_case_with_actual_result_implementation.py',
    'v_2/v_3/problem/void_function_definition.py',
    'v_2/v_3/problem/void_function_definition_that_takes_actual_result.py',
    'v_2/v_3/problem/void_function_signature.py',
    'v_2/v_3/problem/void_function_signature_that_takes_actual_result.py'
]

snapshots['test_pydantic_model lang_server___init__'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model lang_server___init__.py')

snapshots['test_pydantic_model lang_server_lang_server_request'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model lang_server_lang_server_request.py')

snapshots['test_pydantic_model lang_server_lang_server_response'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model lang_server_lang_server_response.py')

snapshots['test_pydantic_model migration___init__'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model migration___init__.py')

snapshots['test_pydantic_model migration_migration'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model migration_migration.py')

snapshots['test_pydantic_model migration_migration_status'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model migration_migration_status.py')

snapshots['test_pydantic_model playlist___init__'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model playlist___init__.py')

snapshots['test_pydantic_model playlist_playlist'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model playlist_playlist.py')

snapshots['test_pydantic_model playlist_playlist_create_request'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model playlist_playlist_create_request.py')

snapshots['test_pydantic_model playlist_playlist_id'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model playlist_playlist_id.py')

snapshots['test_pydantic_model playlist_update_playlist_request'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model playlist_update_playlist_request.py')

snapshots['test_pydantic_model problem___init__'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model problem___init__.py')

snapshots['test_pydantic_model problem_create_problem_error'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model problem_create_problem_error.py')

snapshots['test_pydantic_model problem_create_problem_request'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model problem_create_problem_request.py')

snapshots['test_pydantic_model problem_create_problem_response'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model problem_create_problem_response.py')

snapshots['test_pydantic_model problem_generic_create_problem_error'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model problem_generic_create_problem_error.py')

snapshots['test_pydantic_model problem_get_default_starter_files_request'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model problem_get_default_starter_files_request.py')

snapshots['test_pydantic_model problem_get_default_starter_files_response'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model problem_get_default_starter_files_response.py')

snapshots['test_pydantic_model problem_problem_description'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model problem_problem_description.py')

snapshots['test_pydantic_model problem_problem_description_board'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model problem_problem_description_board.py')

snapshots['test_pydantic_model problem_problem_files'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model problem_problem_files.py')

snapshots['test_pydantic_model problem_problem_info'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model problem_problem_info.py')

snapshots['test_pydantic_model problem_update_problem_response'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model problem_update_problem_response.py')

snapshots['test_pydantic_model problem_variable_type_and_name'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model problem_variable_type_and_name.py')

snapshots['test_pydantic_model submission___init__'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission___init__.py')

snapshots['test_pydantic_model submission_actual_result'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_actual_result.py')

snapshots['test_pydantic_model submission_building_executor_response'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_building_executor_response.py')

snapshots['test_pydantic_model submission_code_execution_update'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_code_execution_update.py')

snapshots['test_pydantic_model submission_compile_error'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_compile_error.py')

snapshots['test_pydantic_model submission_custom_test_cases_unsupported'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_custom_test_cases_unsupported.py')

snapshots['test_pydantic_model submission_error_info'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_error_info.py')

snapshots['test_pydantic_model submission_errored_response'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_errored_response.py')

snapshots['test_pydantic_model submission_exception_info'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_exception_info.py')

snapshots['test_pydantic_model submission_exception_v_2'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_exception_v_2.py')

snapshots['test_pydantic_model submission_execution_session_response'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_execution_session_response.py')

snapshots['test_pydantic_model submission_execution_session_state'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_execution_session_state.py')

snapshots['test_pydantic_model submission_execution_session_status'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_execution_session_status.py')

snapshots['test_pydantic_model submission_existing_submission_executing'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_existing_submission_executing.py')

snapshots['test_pydantic_model submission_expression_location'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_expression_location.py')

snapshots['test_pydantic_model submission_finished_response'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_finished_response.py')

snapshots['test_pydantic_model submission_get_execution_session_state_response'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_get_execution_session_state_response.py')

snapshots['test_pydantic_model submission_get_submission_state_response'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_get_submission_state_response.py')

snapshots['test_pydantic_model submission_get_trace_responses_page_request'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_get_trace_responses_page_request.py')

snapshots['test_pydantic_model submission_graded_response'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_graded_response.py')

snapshots['test_pydantic_model submission_graded_response_v_2'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_graded_response_v_2.py')

snapshots['test_pydantic_model submission_graded_test_case_update'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_graded_test_case_update.py')

snapshots['test_pydantic_model submission_initialize_problem_request'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_initialize_problem_request.py')

snapshots['test_pydantic_model submission_internal_error'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_internal_error.py')

snapshots['test_pydantic_model submission_invalid_request_cause'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_invalid_request_cause.py')

snapshots['test_pydantic_model submission_invalid_request_response'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_invalid_request_response.py')

snapshots['test_pydantic_model submission_lightweight_stackframe_information'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_lightweight_stackframe_information.py')

snapshots['test_pydantic_model submission_recorded_response_notification'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_recorded_response_notification.py')

snapshots['test_pydantic_model submission_recorded_test_case_update'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_recorded_test_case_update.py')

snapshots['test_pydantic_model submission_recording_response_notification'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_recording_response_notification.py')

snapshots['test_pydantic_model submission_running_response'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_running_response.py')

snapshots['test_pydantic_model submission_running_submission_state'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_running_submission_state.py')

snapshots['test_pydantic_model submission_runtime_error'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_runtime_error.py')

snapshots['test_pydantic_model submission_scope'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_scope.py')

snapshots['test_pydantic_model submission_share_id'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_share_id.py')

snapshots['test_pydantic_model submission_stack_frame'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_stack_frame.py')

snapshots['test_pydantic_model submission_stack_information'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_stack_information.py')

snapshots['test_pydantic_model submission_stderr_response'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_stderr_response.py')

snapshots['test_pydantic_model submission_stdout_response'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_stdout_response.py')

snapshots['test_pydantic_model submission_stop_request'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_stop_request.py')

snapshots['test_pydantic_model submission_stopped_response'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_stopped_response.py')

snapshots['test_pydantic_model submission_submission_file_info'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_submission_file_info.py')

snapshots['test_pydantic_model submission_submission_id'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_submission_id.py')

snapshots['test_pydantic_model submission_submission_id_not_found'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_submission_id_not_found.py')

snapshots['test_pydantic_model submission_submission_request'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_submission_request.py')

snapshots['test_pydantic_model submission_submission_response'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_submission_response.py')

snapshots['test_pydantic_model submission_submission_status_for_test_case'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_submission_status_for_test_case.py')

snapshots['test_pydantic_model submission_submission_status_v_2'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_submission_status_v_2.py')

snapshots['test_pydantic_model submission_submission_type_enum'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_submission_type_enum.py')

snapshots['test_pydantic_model submission_submission_type_state'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_submission_type_state.py')

snapshots['test_pydantic_model submission_submit_request_v_2'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_submit_request_v_2.py')

snapshots['test_pydantic_model submission_terminated_response'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_terminated_response.py')

snapshots['test_pydantic_model submission_test_case_grade'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_test_case_grade.py')

snapshots['test_pydantic_model submission_test_case_hidden_grade'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_test_case_hidden_grade.py')

snapshots['test_pydantic_model submission_test_case_non_hidden_grade'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_test_case_non_hidden_grade.py')

snapshots['test_pydantic_model submission_test_case_result'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_test_case_result.py')

snapshots['test_pydantic_model submission_test_case_result_with_stdout'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_test_case_result_with_stdout.py')

snapshots['test_pydantic_model submission_test_submission_state'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_test_submission_state.py')

snapshots['test_pydantic_model submission_test_submission_status'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_test_submission_status.py')

snapshots['test_pydantic_model submission_test_submission_status_v_2'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_test_submission_status_v_2.py')

snapshots['test_pydantic_model submission_test_submission_update'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_test_submission_update.py')

snapshots['test_pydantic_model submission_test_submission_update_info'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_test_submission_update_info.py')

snapshots['test_pydantic_model submission_trace_response'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_trace_response.py')

snapshots['test_pydantic_model submission_trace_response_v_2'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_trace_response_v_2.py')

snapshots['test_pydantic_model submission_trace_responses_page'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_trace_responses_page.py')

snapshots['test_pydantic_model submission_trace_responses_page_v_2'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_trace_responses_page_v_2.py')

snapshots['test_pydantic_model submission_traced_file'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_traced_file.py')

snapshots['test_pydantic_model submission_traced_test_case'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_traced_test_case.py')

snapshots['test_pydantic_model submission_unexpected_language_error'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_unexpected_language_error.py')

snapshots['test_pydantic_model submission_workspace_files'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_workspace_files.py')

snapshots['test_pydantic_model submission_workspace_ran_response'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_workspace_ran_response.py')

snapshots['test_pydantic_model submission_workspace_run_details'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_workspace_run_details.py')

snapshots['test_pydantic_model submission_workspace_starter_files_response'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_workspace_starter_files_response.py')

snapshots['test_pydantic_model submission_workspace_starter_files_response_v_2'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_workspace_starter_files_response_v_2.py')

snapshots['test_pydantic_model submission_workspace_submission_state'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_workspace_submission_state.py')

snapshots['test_pydantic_model submission_workspace_submission_status'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_workspace_submission_status.py')

snapshots['test_pydantic_model submission_workspace_submission_status_v_2'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_workspace_submission_status_v_2.py')

snapshots['test_pydantic_model submission_workspace_submission_update'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_workspace_submission_update.py')

snapshots['test_pydantic_model submission_workspace_submission_update_info'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_workspace_submission_update_info.py')

snapshots['test_pydantic_model submission_workspace_submit_request'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_workspace_submit_request.py')

snapshots['test_pydantic_model submission_workspace_traced_update'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model submission_workspace_traced_update.py')

snapshots['test_pydantic_model v_2___init__'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2___init__.py')

snapshots['test_pydantic_model v_2_problem___init__'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_problem___init__.py')

snapshots['test_pydantic_model v_2_problem_assert_correctness_check'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_problem_assert_correctness_check.py')

snapshots['test_pydantic_model v_2_problem_basic_custom_files'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_problem_basic_custom_files.py')

snapshots['test_pydantic_model v_2_problem_basic_test_case_template'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_problem_basic_test_case_template.py')

snapshots['test_pydantic_model v_2_problem_create_problem_request_v_2'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_problem_create_problem_request_v_2.py')

snapshots['test_pydantic_model v_2_problem_custom_files'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_problem_custom_files.py')

snapshots['test_pydantic_model v_2_problem_deep_equality_correctness_check'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_problem_deep_equality_correctness_check.py')

snapshots['test_pydantic_model v_2_problem_default_provided_file'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_problem_default_provided_file.py')

snapshots['test_pydantic_model v_2_problem_file_info_v_2'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_problem_file_info_v_2.py')

snapshots['test_pydantic_model v_2_problem_files'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_problem_files.py')

snapshots['test_pydantic_model v_2_problem_function_implementation'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_problem_function_implementation.py')

snapshots['test_pydantic_model v_2_problem_function_implementation_for_multiple_languages'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_problem_function_implementation_for_multiple_languages.py')

snapshots['test_pydantic_model v_2_problem_function_signature'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_problem_function_signature.py')

snapshots['test_pydantic_model v_2_problem_generated_files'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_problem_generated_files.py')

snapshots['test_pydantic_model v_2_problem_get_basic_solution_file_request'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_problem_get_basic_solution_file_request.py')

snapshots['test_pydantic_model v_2_problem_get_basic_solution_file_response'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_problem_get_basic_solution_file_response.py')

snapshots['test_pydantic_model v_2_problem_get_function_signature_request'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_problem_get_function_signature_request.py')

snapshots['test_pydantic_model v_2_problem_get_function_signature_response'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_problem_get_function_signature_response.py')

snapshots['test_pydantic_model v_2_problem_get_generated_test_case_file_request'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_problem_get_generated_test_case_file_request.py')

snapshots['test_pydantic_model v_2_problem_get_generated_test_case_template_file_request'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_problem_get_generated_test_case_template_file_request.py')

snapshots['test_pydantic_model v_2_problem_lightweight_problem_info_v_2'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_problem_lightweight_problem_info_v_2.py')

snapshots['test_pydantic_model v_2_problem_non_void_function_definition'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_problem_non_void_function_definition.py')

snapshots['test_pydantic_model v_2_problem_non_void_function_signature'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_problem_non_void_function_signature.py')

snapshots['test_pydantic_model v_2_problem_parameter'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_problem_parameter.py')

snapshots['test_pydantic_model v_2_problem_parameter_id'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_problem_parameter_id.py')

snapshots['test_pydantic_model v_2_problem_problem_info_v_2'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_problem_problem_info_v_2.py')

snapshots['test_pydantic_model v_2_problem_test_case_expects'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_problem_test_case_expects.py')

snapshots['test_pydantic_model v_2_problem_test_case_function'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_problem_test_case_function.py')

snapshots['test_pydantic_model v_2_problem_test_case_id'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_problem_test_case_id.py')

snapshots['test_pydantic_model v_2_problem_test_case_implementation'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_problem_test_case_implementation.py')

snapshots['test_pydantic_model v_2_problem_test_case_implementation_description'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_problem_test_case_implementation_description.py')

snapshots['test_pydantic_model v_2_problem_test_case_implementation_description_board'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_problem_test_case_implementation_description_board.py')

snapshots['test_pydantic_model v_2_problem_test_case_implementation_reference'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_problem_test_case_implementation_reference.py')

snapshots['test_pydantic_model v_2_problem_test_case_metadata'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_problem_test_case_metadata.py')

snapshots['test_pydantic_model v_2_problem_test_case_template'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_problem_test_case_template.py')

snapshots['test_pydantic_model v_2_problem_test_case_template_id'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_problem_test_case_template_id.py')

snapshots['test_pydantic_model v_2_problem_test_case_v_2'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_problem_test_case_v_2.py')

snapshots['test_pydantic_model v_2_problem_test_case_with_actual_result_implementation'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_problem_test_case_with_actual_result_implementation.py')

snapshots['test_pydantic_model v_2_problem_void_function_definition'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_problem_void_function_definition.py')

snapshots['test_pydantic_model v_2_problem_void_function_definition_that_takes_actual_result'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_problem_void_function_definition_that_takes_actual_result.py')

snapshots['test_pydantic_model v_2_problem_void_function_signature'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_problem_void_function_signature.py')

snapshots['test_pydantic_model v_2_problem_void_function_signature_that_takes_actual_result'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_problem_void_function_signature_that_takes_actual_result.py')

snapshots['test_pydantic_model v_2_v_3___init__'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_v_3___init__.py')

snapshots['test_pydantic_model v_2_v_3_problem___init__'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_v_3_problem___init__.py')

snapshots['test_pydantic_model v_2_v_3_problem_assert_correctness_check'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_v_3_problem_assert_correctness_check.py')

snapshots['test_pydantic_model v_2_v_3_problem_basic_custom_files'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_v_3_problem_basic_custom_files.py')

snapshots['test_pydantic_model v_2_v_3_problem_basic_test_case_template'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_v_3_problem_basic_test_case_template.py')

snapshots['test_pydantic_model v_2_v_3_problem_create_problem_request_v_2'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_v_3_problem_create_problem_request_v_2.py')

snapshots['test_pydantic_model v_2_v_3_problem_custom_files'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_v_3_problem_custom_files.py')

snapshots['test_pydantic_model v_2_v_3_problem_deep_equality_correctness_check'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_v_3_problem_deep_equality_correctness_check.py')

snapshots['test_pydantic_model v_2_v_3_problem_default_provided_file'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_v_3_problem_default_provided_file.py')

snapshots['test_pydantic_model v_2_v_3_problem_file_info_v_2'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_v_3_problem_file_info_v_2.py')

snapshots['test_pydantic_model v_2_v_3_problem_files'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_v_3_problem_files.py')

snapshots['test_pydantic_model v_2_v_3_problem_function_implementation'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_v_3_problem_function_implementation.py')

snapshots['test_pydantic_model v_2_v_3_problem_function_implementation_for_multiple_languages'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_v_3_problem_function_implementation_for_multiple_languages.py')

snapshots['test_pydantic_model v_2_v_3_problem_function_signature'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_v_3_problem_function_signature.py')

snapshots['test_pydantic_model v_2_v_3_problem_generated_files'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_v_3_problem_generated_files.py')

snapshots['test_pydantic_model v_2_v_3_problem_get_basic_solution_file_request'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_v_3_problem_get_basic_solution_file_request.py')

snapshots['test_pydantic_model v_2_v_3_problem_get_basic_solution_file_response'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_v_3_problem_get_basic_solution_file_response.py')

snapshots['test_pydantic_model v_2_v_3_problem_get_function_signature_request'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_v_3_problem_get_function_signature_request.py')

snapshots['test_pydantic_model v_2_v_3_problem_get_function_signature_response'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_v_3_problem_get_function_signature_response.py')

snapshots['test_pydantic_model v_2_v_3_problem_get_generated_test_case_file_request'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_v_3_problem_get_generated_test_case_file_request.py')

snapshots['test_pydantic_model v_2_v_3_problem_get_generated_test_case_template_file_request'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_v_3_problem_get_generated_test_case_template_file_request.py')

snapshots['test_pydantic_model v_2_v_3_problem_lightweight_problem_info_v_2'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_v_3_problem_lightweight_problem_info_v_2.py')

snapshots['test_pydantic_model v_2_v_3_problem_non_void_function_definition'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_v_3_problem_non_void_function_definition.py')

snapshots['test_pydantic_model v_2_v_3_problem_non_void_function_signature'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_v_3_problem_non_void_function_signature.py')

snapshots['test_pydantic_model v_2_v_3_problem_parameter'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_v_3_problem_parameter.py')

snapshots['test_pydantic_model v_2_v_3_problem_parameter_id'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_v_3_problem_parameter_id.py')

snapshots['test_pydantic_model v_2_v_3_problem_problem_info_v_2'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_v_3_problem_problem_info_v_2.py')

snapshots['test_pydantic_model v_2_v_3_problem_test_case_expects'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_v_3_problem_test_case_expects.py')

snapshots['test_pydantic_model v_2_v_3_problem_test_case_function'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_v_3_problem_test_case_function.py')

snapshots['test_pydantic_model v_2_v_3_problem_test_case_id'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_v_3_problem_test_case_id.py')

snapshots['test_pydantic_model v_2_v_3_problem_test_case_implementation'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_v_3_problem_test_case_implementation.py')

snapshots['test_pydantic_model v_2_v_3_problem_test_case_implementation_description'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_v_3_problem_test_case_implementation_description.py')

snapshots['test_pydantic_model v_2_v_3_problem_test_case_implementation_description_board'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_v_3_problem_test_case_implementation_description_board.py')

snapshots['test_pydantic_model v_2_v_3_problem_test_case_implementation_reference'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_v_3_problem_test_case_implementation_reference.py')

snapshots['test_pydantic_model v_2_v_3_problem_test_case_metadata'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_v_3_problem_test_case_metadata.py')

snapshots['test_pydantic_model v_2_v_3_problem_test_case_template'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_v_3_problem_test_case_template.py')

snapshots['test_pydantic_model v_2_v_3_problem_test_case_template_id'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_v_3_problem_test_case_template_id.py')

snapshots['test_pydantic_model v_2_v_3_problem_test_case_v_2'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_v_3_problem_test_case_v_2.py')

snapshots['test_pydantic_model v_2_v_3_problem_test_case_with_actual_result_implementation'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_v_3_problem_test_case_with_actual_result_implementation.py')

snapshots['test_pydantic_model v_2_v_3_problem_void_function_definition'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_v_3_problem_void_function_definition.py')

snapshots['test_pydantic_model v_2_v_3_problem_void_function_definition_that_takes_actual_result'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_v_3_problem_void_function_definition_that_takes_actual_result.py')

snapshots['test_pydantic_model v_2_v_3_problem_void_function_signature'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_v_3_problem_void_function_signature.py')

snapshots['test_pydantic_model v_2_v_3_problem_void_function_signature_that_takes_actual_result'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model v_2_v_3_problem_void_function_signature_that_takes_actual_result.py')
