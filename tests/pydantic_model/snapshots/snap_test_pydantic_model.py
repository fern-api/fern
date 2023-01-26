# -*- coding: utf-8 -*-
# snapshottest: v1 - https://goo.gl/zC4yUc
from __future__ import unicode_literals

from snapshottest import Snapshot
from snapshottest.file import FileSnapshot


snapshots = Snapshot()

snapshots['test_pydantic_model __init__'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model __init__.py')

snapshots['test_pydantic_model core___init__'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model core___init__.py')

snapshots['test_pydantic_model core_datetime_utils'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model core_datetime_utils.py')

snapshots['test_pydantic_model filepaths'] = [
    '__init__.py',
    'core/__init__.py',
    'core/datetime_utils.py',
    'resources/__init__.py',
    'resources/admin/__init__.py',
    'resources/admin/test.py',
    'resources/commons/__init__.py',
    'resources/commons/binary_tree_node_and_tree_value.py',
    'resources/commons/binary_tree_node_value.py',
    'resources/commons/binary_tree_value.py',
    'resources/commons/debug_key_value_pairs.py',
    'resources/commons/debug_map_value.py',
    'resources/commons/debug_variable_value.py',
    'resources/commons/doubly_linked_list_node_and_list_value.py',
    'resources/commons/doubly_linked_list_node_value.py',
    'resources/commons/doubly_linked_list_value.py',
    'resources/commons/file_info.py',
    'resources/commons/generic_value.py',
    'resources/commons/key_value_pair.py',
    'resources/commons/language.py',
    'resources/commons/list_type.py',
    'resources/commons/map_type.py',
    'resources/commons/map_value.py',
    'resources/commons/node_id.py',
    'resources/commons/problem_id.py',
    'resources/commons/singly_linked_list_node_and_list_value.py',
    'resources/commons/singly_linked_list_node_value.py',
    'resources/commons/singly_linked_list_value.py',
    'resources/commons/test_case.py',
    'resources/commons/test_case_with_expected_result.py',
    'resources/commons/user_id.py',
    'resources/commons/variable_type.py',
    'resources/commons/variable_value.py',
    'resources/lang_server/__init__.py',
    'resources/lang_server/lang_server_request.py',
    'resources/lang_server/lang_server_response.py',
    'resources/migration/__init__.py',
    'resources/migration/migration.py',
    'resources/migration/migration_status.py',
    'resources/playlist/__init__.py',
    'resources/playlist/playlist.py',
    'resources/playlist/playlist_create_request.py',
    'resources/playlist/playlist_id.py',
    'resources/playlist/playlist_id_not_found_error_body.py',
    'resources/playlist/reserved_keyword_enum.py',
    'resources/playlist/update_playlist_request.py',
    'resources/problem/__init__.py',
    'resources/problem/create_problem_error.py',
    'resources/problem/create_problem_request.py',
    'resources/problem/create_problem_response.py',
    'resources/problem/generic_create_problem_error.py',
    'resources/problem/get_default_starter_files_response.py',
    'resources/problem/problem_description.py',
    'resources/problem/problem_description_board.py',
    'resources/problem/problem_files.py',
    'resources/problem/problem_info.py',
    'resources/problem/update_problem_response.py',
    'resources/problem/variable_type_and_name.py',
    'resources/submission/__init__.py',
    'resources/submission/actual_result.py',
    'resources/submission/building_executor_response.py',
    'resources/submission/code_execution_update.py',
    'resources/submission/compile_error.py',
    'resources/submission/custom_test_cases_unsupported.py',
    'resources/submission/error_info.py',
    'resources/submission/errored_response.py',
    'resources/submission/exception_info.py',
    'resources/submission/exception_v_2.py',
    'resources/submission/execution_session_response.py',
    'resources/submission/execution_session_state.py',
    'resources/submission/execution_session_status.py',
    'resources/submission/existing_submission_executing.py',
    'resources/submission/expression_location.py',
    'resources/submission/finished_response.py',
    'resources/submission/get_execution_session_state_response.py',
    'resources/submission/get_submission_state_response.py',
    'resources/submission/get_trace_responses_page_request.py',
    'resources/submission/graded_response.py',
    'resources/submission/graded_response_v_2.py',
    'resources/submission/graded_test_case_update.py',
    'resources/submission/initialize_problem_request.py',
    'resources/submission/internal_error.py',
    'resources/submission/invalid_request_cause.py',
    'resources/submission/invalid_request_response.py',
    'resources/submission/lightweight_stackframe_information.py',
    'resources/submission/recorded_response_notification.py',
    'resources/submission/recorded_test_case_update.py',
    'resources/submission/recording_response_notification.py',
    'resources/submission/running_response.py',
    'resources/submission/running_submission_state.py',
    'resources/submission/runtime_error.py',
    'resources/submission/scope.py',
    'resources/submission/share_id.py',
    'resources/submission/stack_frame.py',
    'resources/submission/stack_information.py',
    'resources/submission/stderr_response.py',
    'resources/submission/stdout_response.py',
    'resources/submission/stop_request.py',
    'resources/submission/stopped_response.py',
    'resources/submission/submission_file_info.py',
    'resources/submission/submission_id.py',
    'resources/submission/submission_id_not_found.py',
    'resources/submission/submission_request.py',
    'resources/submission/submission_response.py',
    'resources/submission/submission_status_for_test_case.py',
    'resources/submission/submission_status_v_2.py',
    'resources/submission/submission_type_enum.py',
    'resources/submission/submission_type_state.py',
    'resources/submission/submit_request_v_2.py',
    'resources/submission/terminated_response.py',
    'resources/submission/test_case_grade.py',
    'resources/submission/test_case_hidden_grade.py',
    'resources/submission/test_case_non_hidden_grade.py',
    'resources/submission/test_case_result.py',
    'resources/submission/test_case_result_with_stdout.py',
    'resources/submission/test_submission_state.py',
    'resources/submission/test_submission_status.py',
    'resources/submission/test_submission_status_v_2.py',
    'resources/submission/test_submission_update.py',
    'resources/submission/test_submission_update_info.py',
    'resources/submission/trace_response.py',
    'resources/submission/trace_response_v_2.py',
    'resources/submission/trace_responses_page.py',
    'resources/submission/trace_responses_page_v_2.py',
    'resources/submission/traced_file.py',
    'resources/submission/traced_test_case.py',
    'resources/submission/unexpected_language_error.py',
    'resources/submission/workspace_files.py',
    'resources/submission/workspace_ran_response.py',
    'resources/submission/workspace_run_details.py',
    'resources/submission/workspace_starter_files_response.py',
    'resources/submission/workspace_starter_files_response_v_2.py',
    'resources/submission/workspace_submission_state.py',
    'resources/submission/workspace_submission_status.py',
    'resources/submission/workspace_submission_status_v_2.py',
    'resources/submission/workspace_submission_update.py',
    'resources/submission/workspace_submission_update_info.py',
    'resources/submission/workspace_submit_request.py',
    'resources/submission/workspace_traced_update.py',
    'resources/v_2/__init__.py',
    'resources/v_2/problem/__init__.py',
    'resources/v_2/problem/assert_correctness_check.py',
    'resources/v_2/problem/basic_custom_files.py',
    'resources/v_2/problem/basic_test_case_template.py',
    'resources/v_2/problem/create_problem_request_v_2.py',
    'resources/v_2/problem/custom_files.py',
    'resources/v_2/problem/deep_equality_correctness_check.py',
    'resources/v_2/problem/default_provided_file.py',
    'resources/v_2/problem/file_info_v_2.py',
    'resources/v_2/problem/files.py',
    'resources/v_2/problem/function_implementation.py',
    'resources/v_2/problem/function_implementation_for_multiple_languages.py',
    'resources/v_2/problem/function_signature.py',
    'resources/v_2/problem/generated_files.py',
    'resources/v_2/problem/get_basic_solution_file_request.py',
    'resources/v_2/problem/get_basic_solution_file_response.py',
    'resources/v_2/problem/get_function_signature_request.py',
    'resources/v_2/problem/get_function_signature_response.py',
    'resources/v_2/problem/get_generated_test_case_file_request.py',
    'resources/v_2/problem/get_generated_test_case_template_file_request.py',
    'resources/v_2/problem/lightweight_problem_info_v_2.py',
    'resources/v_2/problem/non_void_function_definition.py',
    'resources/v_2/problem/non_void_function_signature.py',
    'resources/v_2/problem/parameter.py',
    'resources/v_2/problem/parameter_id.py',
    'resources/v_2/problem/problem_info_v_2.py',
    'resources/v_2/problem/test_case_expects.py',
    'resources/v_2/problem/test_case_function.py',
    'resources/v_2/problem/test_case_id.py',
    'resources/v_2/problem/test_case_implementation.py',
    'resources/v_2/problem/test_case_implementation_description.py',
    'resources/v_2/problem/test_case_implementation_description_board.py',
    'resources/v_2/problem/test_case_implementation_reference.py',
    'resources/v_2/problem/test_case_metadata.py',
    'resources/v_2/problem/test_case_template.py',
    'resources/v_2/problem/test_case_template_id.py',
    'resources/v_2/problem/test_case_v_2.py',
    'resources/v_2/problem/test_case_with_actual_result_implementation.py',
    'resources/v_2/problem/void_function_definition.py',
    'resources/v_2/problem/void_function_definition_that_takes_actual_result.py',
    'resources/v_2/problem/void_function_signature.py',
    'resources/v_2/problem/void_function_signature_that_takes_actual_result.py',
    'resources/v_2/v_3/__init__.py',
    'resources/v_2/v_3/problem/__init__.py',
    'resources/v_2/v_3/problem/assert_correctness_check.py',
    'resources/v_2/v_3/problem/basic_custom_files.py',
    'resources/v_2/v_3/problem/basic_test_case_template.py',
    'resources/v_2/v_3/problem/create_problem_request_v_2.py',
    'resources/v_2/v_3/problem/custom_files.py',
    'resources/v_2/v_3/problem/deep_equality_correctness_check.py',
    'resources/v_2/v_3/problem/default_provided_file.py',
    'resources/v_2/v_3/problem/file_info_v_2.py',
    'resources/v_2/v_3/problem/files.py',
    'resources/v_2/v_3/problem/function_implementation.py',
    'resources/v_2/v_3/problem/function_implementation_for_multiple_languages.py',
    'resources/v_2/v_3/problem/function_signature.py',
    'resources/v_2/v_3/problem/generated_files.py',
    'resources/v_2/v_3/problem/get_basic_solution_file_request.py',
    'resources/v_2/v_3/problem/get_basic_solution_file_response.py',
    'resources/v_2/v_3/problem/get_function_signature_request.py',
    'resources/v_2/v_3/problem/get_function_signature_response.py',
    'resources/v_2/v_3/problem/get_generated_test_case_file_request.py',
    'resources/v_2/v_3/problem/get_generated_test_case_template_file_request.py',
    'resources/v_2/v_3/problem/lightweight_problem_info_v_2.py',
    'resources/v_2/v_3/problem/non_void_function_definition.py',
    'resources/v_2/v_3/problem/non_void_function_signature.py',
    'resources/v_2/v_3/problem/parameter.py',
    'resources/v_2/v_3/problem/parameter_id.py',
    'resources/v_2/v_3/problem/problem_info_v_2.py',
    'resources/v_2/v_3/problem/test_case_expects.py',
    'resources/v_2/v_3/problem/test_case_function.py',
    'resources/v_2/v_3/problem/test_case_id.py',
    'resources/v_2/v_3/problem/test_case_implementation.py',
    'resources/v_2/v_3/problem/test_case_implementation_description.py',
    'resources/v_2/v_3/problem/test_case_implementation_description_board.py',
    'resources/v_2/v_3/problem/test_case_implementation_reference.py',
    'resources/v_2/v_3/problem/test_case_metadata.py',
    'resources/v_2/v_3/problem/test_case_template.py',
    'resources/v_2/v_3/problem/test_case_template_id.py',
    'resources/v_2/v_3/problem/test_case_v_2.py',
    'resources/v_2/v_3/problem/test_case_with_actual_result_implementation.py',
    'resources/v_2/v_3/problem/void_function_definition.py',
    'resources/v_2/v_3/problem/void_function_definition_that_takes_actual_result.py',
    'resources/v_2/v_3/problem/void_function_signature.py',
    'resources/v_2/v_3/problem/void_function_signature_that_takes_actual_result.py'
]

snapshots['test_pydantic_model resources___init__'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources___init__.py')

snapshots['test_pydantic_model resources_admin___init__'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_admin___init__.py')

snapshots['test_pydantic_model resources_admin_test'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_admin_test.py')

snapshots['test_pydantic_model resources_commons___init__'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_commons___init__.py')

snapshots['test_pydantic_model resources_commons_binary_tree_node_and_tree_value'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_commons_binary_tree_node_and_tree_value.py')

snapshots['test_pydantic_model resources_commons_binary_tree_node_value'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_commons_binary_tree_node_value.py')

snapshots['test_pydantic_model resources_commons_binary_tree_value'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_commons_binary_tree_value.py')

snapshots['test_pydantic_model resources_commons_debug_key_value_pairs'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_commons_debug_key_value_pairs.py')

snapshots['test_pydantic_model resources_commons_debug_map_value'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_commons_debug_map_value.py')

snapshots['test_pydantic_model resources_commons_debug_variable_value'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_commons_debug_variable_value.py')

snapshots['test_pydantic_model resources_commons_doubly_linked_list_node_and_list_value'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_commons_doubly_linked_list_node_and_list_value.py')

snapshots['test_pydantic_model resources_commons_doubly_linked_list_node_value'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_commons_doubly_linked_list_node_value.py')

snapshots['test_pydantic_model resources_commons_doubly_linked_list_value'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_commons_doubly_linked_list_value.py')

snapshots['test_pydantic_model resources_commons_file_info'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_commons_file_info.py')

snapshots['test_pydantic_model resources_commons_generic_value'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_commons_generic_value.py')

snapshots['test_pydantic_model resources_commons_key_value_pair'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_commons_key_value_pair.py')

snapshots['test_pydantic_model resources_commons_language'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_commons_language.py')

snapshots['test_pydantic_model resources_commons_list_type'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_commons_list_type.py')

snapshots['test_pydantic_model resources_commons_map_type'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_commons_map_type.py')

snapshots['test_pydantic_model resources_commons_map_value'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_commons_map_value.py')

snapshots['test_pydantic_model resources_commons_node_id'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_commons_node_id.py')

snapshots['test_pydantic_model resources_commons_problem_id'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_commons_problem_id.py')

snapshots['test_pydantic_model resources_commons_singly_linked_list_node_and_list_value'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_commons_singly_linked_list_node_and_list_value.py')

snapshots['test_pydantic_model resources_commons_singly_linked_list_node_value'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_commons_singly_linked_list_node_value.py')

snapshots['test_pydantic_model resources_commons_singly_linked_list_value'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_commons_singly_linked_list_value.py')

snapshots['test_pydantic_model resources_commons_test_case'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_commons_test_case.py')

snapshots['test_pydantic_model resources_commons_test_case_with_expected_result'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_commons_test_case_with_expected_result.py')

snapshots['test_pydantic_model resources_commons_user_id'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_commons_user_id.py')

snapshots['test_pydantic_model resources_commons_variable_type'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_commons_variable_type.py')

snapshots['test_pydantic_model resources_commons_variable_value'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_commons_variable_value.py')

snapshots['test_pydantic_model resources_lang_server___init__'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_lang_server___init__.py')

snapshots['test_pydantic_model resources_lang_server_lang_server_request'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_lang_server_lang_server_request.py')

snapshots['test_pydantic_model resources_lang_server_lang_server_response'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_lang_server_lang_server_response.py')

snapshots['test_pydantic_model resources_migration___init__'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_migration___init__.py')

snapshots['test_pydantic_model resources_migration_migration'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_migration_migration.py')

snapshots['test_pydantic_model resources_migration_migration_status'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_migration_migration_status.py')

snapshots['test_pydantic_model resources_playlist___init__'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_playlist___init__.py')

snapshots['test_pydantic_model resources_playlist_playlist'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_playlist_playlist.py')

snapshots['test_pydantic_model resources_playlist_playlist_create_request'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_playlist_playlist_create_request.py')

snapshots['test_pydantic_model resources_playlist_playlist_id'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_playlist_playlist_id.py')

snapshots['test_pydantic_model resources_playlist_playlist_id_not_found_error_body'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_playlist_playlist_id_not_found_error_body.py')

snapshots['test_pydantic_model resources_playlist_reserved_keyword_enum'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_playlist_reserved_keyword_enum.py')

snapshots['test_pydantic_model resources_playlist_update_playlist_request'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_playlist_update_playlist_request.py')

snapshots['test_pydantic_model resources_problem___init__'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_problem___init__.py')

snapshots['test_pydantic_model resources_problem_create_problem_error'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_problem_create_problem_error.py')

snapshots['test_pydantic_model resources_problem_create_problem_request'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_problem_create_problem_request.py')

snapshots['test_pydantic_model resources_problem_create_problem_response'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_problem_create_problem_response.py')

snapshots['test_pydantic_model resources_problem_generic_create_problem_error'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_problem_generic_create_problem_error.py')

snapshots['test_pydantic_model resources_problem_get_default_starter_files_response'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_problem_get_default_starter_files_response.py')

snapshots['test_pydantic_model resources_problem_problem_description'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_problem_problem_description.py')

snapshots['test_pydantic_model resources_problem_problem_description_board'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_problem_problem_description_board.py')

snapshots['test_pydantic_model resources_problem_problem_files'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_problem_problem_files.py')

snapshots['test_pydantic_model resources_problem_problem_info'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_problem_problem_info.py')

snapshots['test_pydantic_model resources_problem_update_problem_response'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_problem_update_problem_response.py')

snapshots['test_pydantic_model resources_problem_variable_type_and_name'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_problem_variable_type_and_name.py')

snapshots['test_pydantic_model resources_submission___init__'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission___init__.py')

snapshots['test_pydantic_model resources_submission_actual_result'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_actual_result.py')

snapshots['test_pydantic_model resources_submission_building_executor_response'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_building_executor_response.py')

snapshots['test_pydantic_model resources_submission_code_execution_update'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_code_execution_update.py')

snapshots['test_pydantic_model resources_submission_compile_error'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_compile_error.py')

snapshots['test_pydantic_model resources_submission_custom_test_cases_unsupported'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_custom_test_cases_unsupported.py')

snapshots['test_pydantic_model resources_submission_error_info'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_error_info.py')

snapshots['test_pydantic_model resources_submission_errored_response'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_errored_response.py')

snapshots['test_pydantic_model resources_submission_exception_info'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_exception_info.py')

snapshots['test_pydantic_model resources_submission_exception_v_2'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_exception_v_2.py')

snapshots['test_pydantic_model resources_submission_execution_session_response'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_execution_session_response.py')

snapshots['test_pydantic_model resources_submission_execution_session_state'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_execution_session_state.py')

snapshots['test_pydantic_model resources_submission_execution_session_status'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_execution_session_status.py')

snapshots['test_pydantic_model resources_submission_existing_submission_executing'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_existing_submission_executing.py')

snapshots['test_pydantic_model resources_submission_expression_location'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_expression_location.py')

snapshots['test_pydantic_model resources_submission_finished_response'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_finished_response.py')

snapshots['test_pydantic_model resources_submission_get_execution_session_state_response'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_get_execution_session_state_response.py')

snapshots['test_pydantic_model resources_submission_get_submission_state_response'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_get_submission_state_response.py')

snapshots['test_pydantic_model resources_submission_get_trace_responses_page_request'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_get_trace_responses_page_request.py')

snapshots['test_pydantic_model resources_submission_graded_response'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_graded_response.py')

snapshots['test_pydantic_model resources_submission_graded_response_v_2'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_graded_response_v_2.py')

snapshots['test_pydantic_model resources_submission_graded_test_case_update'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_graded_test_case_update.py')

snapshots['test_pydantic_model resources_submission_initialize_problem_request'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_initialize_problem_request.py')

snapshots['test_pydantic_model resources_submission_internal_error'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_internal_error.py')

snapshots['test_pydantic_model resources_submission_invalid_request_cause'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_invalid_request_cause.py')

snapshots['test_pydantic_model resources_submission_invalid_request_response'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_invalid_request_response.py')

snapshots['test_pydantic_model resources_submission_lightweight_stackframe_information'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_lightweight_stackframe_information.py')

snapshots['test_pydantic_model resources_submission_recorded_response_notification'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_recorded_response_notification.py')

snapshots['test_pydantic_model resources_submission_recorded_test_case_update'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_recorded_test_case_update.py')

snapshots['test_pydantic_model resources_submission_recording_response_notification'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_recording_response_notification.py')

snapshots['test_pydantic_model resources_submission_running_response'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_running_response.py')

snapshots['test_pydantic_model resources_submission_running_submission_state'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_running_submission_state.py')

snapshots['test_pydantic_model resources_submission_runtime_error'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_runtime_error.py')

snapshots['test_pydantic_model resources_submission_scope'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_scope.py')

snapshots['test_pydantic_model resources_submission_share_id'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_share_id.py')

snapshots['test_pydantic_model resources_submission_stack_frame'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_stack_frame.py')

snapshots['test_pydantic_model resources_submission_stack_information'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_stack_information.py')

snapshots['test_pydantic_model resources_submission_stderr_response'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_stderr_response.py')

snapshots['test_pydantic_model resources_submission_stdout_response'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_stdout_response.py')

snapshots['test_pydantic_model resources_submission_stop_request'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_stop_request.py')

snapshots['test_pydantic_model resources_submission_stopped_response'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_stopped_response.py')

snapshots['test_pydantic_model resources_submission_submission_file_info'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_submission_file_info.py')

snapshots['test_pydantic_model resources_submission_submission_id'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_submission_id.py')

snapshots['test_pydantic_model resources_submission_submission_id_not_found'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_submission_id_not_found.py')

snapshots['test_pydantic_model resources_submission_submission_request'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_submission_request.py')

snapshots['test_pydantic_model resources_submission_submission_response'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_submission_response.py')

snapshots['test_pydantic_model resources_submission_submission_status_for_test_case'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_submission_status_for_test_case.py')

snapshots['test_pydantic_model resources_submission_submission_status_v_2'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_submission_status_v_2.py')

snapshots['test_pydantic_model resources_submission_submission_type_enum'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_submission_type_enum.py')

snapshots['test_pydantic_model resources_submission_submission_type_state'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_submission_type_state.py')

snapshots['test_pydantic_model resources_submission_submit_request_v_2'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_submit_request_v_2.py')

snapshots['test_pydantic_model resources_submission_terminated_response'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_terminated_response.py')

snapshots['test_pydantic_model resources_submission_test_case_grade'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_test_case_grade.py')

snapshots['test_pydantic_model resources_submission_test_case_hidden_grade'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_test_case_hidden_grade.py')

snapshots['test_pydantic_model resources_submission_test_case_non_hidden_grade'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_test_case_non_hidden_grade.py')

snapshots['test_pydantic_model resources_submission_test_case_result'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_test_case_result.py')

snapshots['test_pydantic_model resources_submission_test_case_result_with_stdout'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_test_case_result_with_stdout.py')

snapshots['test_pydantic_model resources_submission_test_submission_state'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_test_submission_state.py')

snapshots['test_pydantic_model resources_submission_test_submission_status'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_test_submission_status.py')

snapshots['test_pydantic_model resources_submission_test_submission_status_v_2'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_test_submission_status_v_2.py')

snapshots['test_pydantic_model resources_submission_test_submission_update'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_test_submission_update.py')

snapshots['test_pydantic_model resources_submission_test_submission_update_info'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_test_submission_update_info.py')

snapshots['test_pydantic_model resources_submission_trace_response'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_trace_response.py')

snapshots['test_pydantic_model resources_submission_trace_response_v_2'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_trace_response_v_2.py')

snapshots['test_pydantic_model resources_submission_trace_responses_page'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_trace_responses_page.py')

snapshots['test_pydantic_model resources_submission_trace_responses_page_v_2'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_trace_responses_page_v_2.py')

snapshots['test_pydantic_model resources_submission_traced_file'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_traced_file.py')

snapshots['test_pydantic_model resources_submission_traced_test_case'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_traced_test_case.py')

snapshots['test_pydantic_model resources_submission_unexpected_language_error'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_unexpected_language_error.py')

snapshots['test_pydantic_model resources_submission_workspace_files'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_workspace_files.py')

snapshots['test_pydantic_model resources_submission_workspace_ran_response'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_workspace_ran_response.py')

snapshots['test_pydantic_model resources_submission_workspace_run_details'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_workspace_run_details.py')

snapshots['test_pydantic_model resources_submission_workspace_starter_files_response'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_workspace_starter_files_response.py')

snapshots['test_pydantic_model resources_submission_workspace_starter_files_response_v_2'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_workspace_starter_files_response_v_2.py')

snapshots['test_pydantic_model resources_submission_workspace_submission_state'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_workspace_submission_state.py')

snapshots['test_pydantic_model resources_submission_workspace_submission_status'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_workspace_submission_status.py')

snapshots['test_pydantic_model resources_submission_workspace_submission_status_v_2'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_workspace_submission_status_v_2.py')

snapshots['test_pydantic_model resources_submission_workspace_submission_update'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_workspace_submission_update.py')

snapshots['test_pydantic_model resources_submission_workspace_submission_update_info'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_workspace_submission_update_info.py')

snapshots['test_pydantic_model resources_submission_workspace_submit_request'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_workspace_submit_request.py')

snapshots['test_pydantic_model resources_submission_workspace_traced_update'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_submission_workspace_traced_update.py')

snapshots['test_pydantic_model resources_v_2___init__'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2___init__.py')

snapshots['test_pydantic_model resources_v_2_problem___init__'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_problem___init__.py')

snapshots['test_pydantic_model resources_v_2_problem_assert_correctness_check'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_problem_assert_correctness_check.py')

snapshots['test_pydantic_model resources_v_2_problem_basic_custom_files'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_problem_basic_custom_files.py')

snapshots['test_pydantic_model resources_v_2_problem_basic_test_case_template'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_problem_basic_test_case_template.py')

snapshots['test_pydantic_model resources_v_2_problem_create_problem_request_v_2'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_problem_create_problem_request_v_2.py')

snapshots['test_pydantic_model resources_v_2_problem_custom_files'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_problem_custom_files.py')

snapshots['test_pydantic_model resources_v_2_problem_deep_equality_correctness_check'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_problem_deep_equality_correctness_check.py')

snapshots['test_pydantic_model resources_v_2_problem_default_provided_file'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_problem_default_provided_file.py')

snapshots['test_pydantic_model resources_v_2_problem_file_info_v_2'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_problem_file_info_v_2.py')

snapshots['test_pydantic_model resources_v_2_problem_files'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_problem_files.py')

snapshots['test_pydantic_model resources_v_2_problem_function_implementation'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_problem_function_implementation.py')

snapshots['test_pydantic_model resources_v_2_problem_function_implementation_for_multiple_languages'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_problem_function_implementation_for_multiple_languages.py')

snapshots['test_pydantic_model resources_v_2_problem_function_signature'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_problem_function_signature.py')

snapshots['test_pydantic_model resources_v_2_problem_generated_files'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_problem_generated_files.py')

snapshots['test_pydantic_model resources_v_2_problem_get_basic_solution_file_request'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_problem_get_basic_solution_file_request.py')

snapshots['test_pydantic_model resources_v_2_problem_get_basic_solution_file_response'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_problem_get_basic_solution_file_response.py')

snapshots['test_pydantic_model resources_v_2_problem_get_function_signature_request'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_problem_get_function_signature_request.py')

snapshots['test_pydantic_model resources_v_2_problem_get_function_signature_response'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_problem_get_function_signature_response.py')

snapshots['test_pydantic_model resources_v_2_problem_get_generated_test_case_file_request'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_problem_get_generated_test_case_file_request.py')

snapshots['test_pydantic_model resources_v_2_problem_get_generated_test_case_template_file_request'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_problem_get_generated_test_case_template_file_request.py')

snapshots['test_pydantic_model resources_v_2_problem_lightweight_problem_info_v_2'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_problem_lightweight_problem_info_v_2.py')

snapshots['test_pydantic_model resources_v_2_problem_non_void_function_definition'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_problem_non_void_function_definition.py')

snapshots['test_pydantic_model resources_v_2_problem_non_void_function_signature'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_problem_non_void_function_signature.py')

snapshots['test_pydantic_model resources_v_2_problem_parameter'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_problem_parameter.py')

snapshots['test_pydantic_model resources_v_2_problem_parameter_id'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_problem_parameter_id.py')

snapshots['test_pydantic_model resources_v_2_problem_problem_info_v_2'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_problem_problem_info_v_2.py')

snapshots['test_pydantic_model resources_v_2_problem_test_case_expects'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_problem_test_case_expects.py')

snapshots['test_pydantic_model resources_v_2_problem_test_case_function'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_problem_test_case_function.py')

snapshots['test_pydantic_model resources_v_2_problem_test_case_id'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_problem_test_case_id.py')

snapshots['test_pydantic_model resources_v_2_problem_test_case_implementation'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_problem_test_case_implementation.py')

snapshots['test_pydantic_model resources_v_2_problem_test_case_implementation_description'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_problem_test_case_implementation_description.py')

snapshots['test_pydantic_model resources_v_2_problem_test_case_implementation_description_board'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_problem_test_case_implementation_description_board.py')

snapshots['test_pydantic_model resources_v_2_problem_test_case_implementation_reference'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_problem_test_case_implementation_reference.py')

snapshots['test_pydantic_model resources_v_2_problem_test_case_metadata'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_problem_test_case_metadata.py')

snapshots['test_pydantic_model resources_v_2_problem_test_case_template'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_problem_test_case_template.py')

snapshots['test_pydantic_model resources_v_2_problem_test_case_template_id'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_problem_test_case_template_id.py')

snapshots['test_pydantic_model resources_v_2_problem_test_case_v_2'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_problem_test_case_v_2.py')

snapshots['test_pydantic_model resources_v_2_problem_test_case_with_actual_result_implementation'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_problem_test_case_with_actual_result_implementation.py')

snapshots['test_pydantic_model resources_v_2_problem_void_function_definition'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_problem_void_function_definition.py')

snapshots['test_pydantic_model resources_v_2_problem_void_function_definition_that_takes_actual_result'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_problem_void_function_definition_that_takes_actual_result.py')

snapshots['test_pydantic_model resources_v_2_problem_void_function_signature'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_problem_void_function_signature.py')

snapshots['test_pydantic_model resources_v_2_problem_void_function_signature_that_takes_actual_result'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_problem_void_function_signature_that_takes_actual_result.py')

snapshots['test_pydantic_model resources_v_2_v_3___init__'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_v_3___init__.py')

snapshots['test_pydantic_model resources_v_2_v_3_problem___init__'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_v_3_problem___init__.py')

snapshots['test_pydantic_model resources_v_2_v_3_problem_assert_correctness_check'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_v_3_problem_assert_correctness_check.py')

snapshots['test_pydantic_model resources_v_2_v_3_problem_basic_custom_files'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_v_3_problem_basic_custom_files.py')

snapshots['test_pydantic_model resources_v_2_v_3_problem_basic_test_case_template'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_v_3_problem_basic_test_case_template.py')

snapshots['test_pydantic_model resources_v_2_v_3_problem_create_problem_request_v_2'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_v_3_problem_create_problem_request_v_2.py')

snapshots['test_pydantic_model resources_v_2_v_3_problem_custom_files'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_v_3_problem_custom_files.py')

snapshots['test_pydantic_model resources_v_2_v_3_problem_deep_equality_correctness_check'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_v_3_problem_deep_equality_correctness_check.py')

snapshots['test_pydantic_model resources_v_2_v_3_problem_default_provided_file'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_v_3_problem_default_provided_file.py')

snapshots['test_pydantic_model resources_v_2_v_3_problem_file_info_v_2'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_v_3_problem_file_info_v_2.py')

snapshots['test_pydantic_model resources_v_2_v_3_problem_files'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_v_3_problem_files.py')

snapshots['test_pydantic_model resources_v_2_v_3_problem_function_implementation'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_v_3_problem_function_implementation.py')

snapshots['test_pydantic_model resources_v_2_v_3_problem_function_implementation_for_multiple_languages'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_v_3_problem_function_implementation_for_multiple_languages.py')

snapshots['test_pydantic_model resources_v_2_v_3_problem_function_signature'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_v_3_problem_function_signature.py')

snapshots['test_pydantic_model resources_v_2_v_3_problem_generated_files'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_v_3_problem_generated_files.py')

snapshots['test_pydantic_model resources_v_2_v_3_problem_get_basic_solution_file_request'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_v_3_problem_get_basic_solution_file_request.py')

snapshots['test_pydantic_model resources_v_2_v_3_problem_get_basic_solution_file_response'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_v_3_problem_get_basic_solution_file_response.py')

snapshots['test_pydantic_model resources_v_2_v_3_problem_get_function_signature_request'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_v_3_problem_get_function_signature_request.py')

snapshots['test_pydantic_model resources_v_2_v_3_problem_get_function_signature_response'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_v_3_problem_get_function_signature_response.py')

snapshots['test_pydantic_model resources_v_2_v_3_problem_get_generated_test_case_file_request'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_v_3_problem_get_generated_test_case_file_request.py')

snapshots['test_pydantic_model resources_v_2_v_3_problem_get_generated_test_case_template_file_request'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_v_3_problem_get_generated_test_case_template_file_request.py')

snapshots['test_pydantic_model resources_v_2_v_3_problem_lightweight_problem_info_v_2'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_v_3_problem_lightweight_problem_info_v_2.py')

snapshots['test_pydantic_model resources_v_2_v_3_problem_non_void_function_definition'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_v_3_problem_non_void_function_definition.py')

snapshots['test_pydantic_model resources_v_2_v_3_problem_non_void_function_signature'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_v_3_problem_non_void_function_signature.py')

snapshots['test_pydantic_model resources_v_2_v_3_problem_parameter'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_v_3_problem_parameter.py')

snapshots['test_pydantic_model resources_v_2_v_3_problem_parameter_id'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_v_3_problem_parameter_id.py')

snapshots['test_pydantic_model resources_v_2_v_3_problem_problem_info_v_2'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_v_3_problem_problem_info_v_2.py')

snapshots['test_pydantic_model resources_v_2_v_3_problem_test_case_expects'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_v_3_problem_test_case_expects.py')

snapshots['test_pydantic_model resources_v_2_v_3_problem_test_case_function'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_v_3_problem_test_case_function.py')

snapshots['test_pydantic_model resources_v_2_v_3_problem_test_case_id'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_v_3_problem_test_case_id.py')

snapshots['test_pydantic_model resources_v_2_v_3_problem_test_case_implementation'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_v_3_problem_test_case_implementation.py')

snapshots['test_pydantic_model resources_v_2_v_3_problem_test_case_implementation_description'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_v_3_problem_test_case_implementation_description.py')

snapshots['test_pydantic_model resources_v_2_v_3_problem_test_case_implementation_description_board'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_v_3_problem_test_case_implementation_description_board.py')

snapshots['test_pydantic_model resources_v_2_v_3_problem_test_case_implementation_reference'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_v_3_problem_test_case_implementation_reference.py')

snapshots['test_pydantic_model resources_v_2_v_3_problem_test_case_metadata'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_v_3_problem_test_case_metadata.py')

snapshots['test_pydantic_model resources_v_2_v_3_problem_test_case_template'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_v_3_problem_test_case_template.py')

snapshots['test_pydantic_model resources_v_2_v_3_problem_test_case_template_id'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_v_3_problem_test_case_template_id.py')

snapshots['test_pydantic_model resources_v_2_v_3_problem_test_case_v_2'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_v_3_problem_test_case_v_2.py')

snapshots['test_pydantic_model resources_v_2_v_3_problem_test_case_with_actual_result_implementation'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_v_3_problem_test_case_with_actual_result_implementation.py')

snapshots['test_pydantic_model resources_v_2_v_3_problem_void_function_definition'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_v_3_problem_void_function_definition.py')

snapshots['test_pydantic_model resources_v_2_v_3_problem_void_function_definition_that_takes_actual_result'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_v_3_problem_void_function_definition_that_takes_actual_result.py')

snapshots['test_pydantic_model resources_v_2_v_3_problem_void_function_signature'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_v_3_problem_void_function_signature.py')

snapshots['test_pydantic_model resources_v_2_v_3_problem_void_function_signature_that_takes_actual_result'] = FileSnapshot('snap_test_pydantic_model/test_pydantic_model resources_v_2_v_3_problem_void_function_signature_that_takes_actual_result.py')
