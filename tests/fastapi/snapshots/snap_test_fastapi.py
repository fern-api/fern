# -*- coding: utf-8 -*-
# snapshottest: v1 - https://goo.gl/zC4yUc
from __future__ import unicode_literals

from snapshottest import Snapshot
from snapshottest.file import FileSnapshot


snapshots = Snapshot()

snapshots['test_fastapi filepaths'] = set([
    'my-api/src/submission/types/custom_test_cases_unsupported.py',
    'my-api/src/submission/types/get_submission_state_response.py',
    'my-api/src/commons/types/test_case_with_expected_result.py',
    'my-api/src/submission/types/exception_info.py',
    'my-api/src/v_2/v_3/problem/types/test_case_function.py',
    'my-api/src/v_2/problem/types/test_case_template_id.py',
    'my-api/src/v_2/problem/types/test_case_metadata.py',
    'my-api/src/submission/types/code_execution_update.py',
    'my-api/src/submission/types/stop_request.py',
    'my-api/src/v_2/v_3/problem/types/get_function_signature_request.py',
    'my-api/src/v_2/v_3/problem/types/test_case_implementation.py',
    'my-api/src/migration/__init__.py',
    'my-api/src/submission/types/workspace_starter_files_response_v_2.py',
    'my-api/src/submission/types/trace_responses_page.py',
    'my-api/src/v_2/v_3/problem/types/get_generated_test_case_template_file_request.py',
    'my-api/src/submission/types/test_submission_update_info.py',
    'my-api/src/commons/types/singly_linked_list_value.py',
    'my-api/src/commons/types/variable_type.py',
    'my-api/src/submission/types/submission_id_not_found.py',
    'my-api/src/commons/types/file_info.py',
    'my-api/src/commons/__init__.py',
    'my-api/src/v_2/problem/types/test_case_template.py',
    'my-api/src/v_2/problem/types/file_info_v_2.py',
    'my-api/src/v_2/problem/types/get_function_signature_request.py',
    'my-api/src/problem/__init__.py',
    'my-api/src/submission/types/stopped_response.py',
    'my-api/src/v_2/problem/types/parameter_id.py',
    'my-api/src/commons/types/doubly_linked_list_node_value.py',
    'my-api/src/problem/types/create_problem_error.py',
    'my-api/src/submission/types/workspace_submit_request.py',
    'my-api/src/submission/types/submission_status_for_test_case.py',
    'my-api/src/problem/types/problem_description.py',
    'my-api/src/submission/types/invalid_request_response.py',
    'my-api/src/v_2/v_3/problem/types/basic_test_case_template.py',
    'my-api/src/v_2/v_3/problem/types/test_case_with_actual_result_implementation.py',
    'my-api/src/submission/types/scope.py',
    'my-api/src/v_2/v_3/problem/types/test_case_id.py',
    'my-api/src/v_2/v_3/problem/types/get_function_signature_response.py',
    'my-api/src/lang_server/types/lang_server_request.py',
    'my-api/src/v_2/problem/types/test_case_expects.py',
    'my-api/src/commons/types/binary_tree_node_and_tree_value.py',
    'my-api/src/submission/types/workspace_ran_response.py',
    'my-api/src/submission/types/__init__.py',
    'my-api/src/v_2/v_3/problem/types/function_signature.py',
    'my-api/src/__init__.py',
    'my-api/src/submission/types/expression_location.py',
    'my-api/src/v_2/problem/types/test_case_v_2.py',
    'my-api/src/submission/types/execution_session_state.py',
    'my-api/src/submission/types/share_id.py',
    'my-api/src/v_2/problem/types/lightweight_problem_info_v_2.py',
    'my-api/src/playlist/types/playlist_id.py',
    'my-api/src/v_2/v_3/problem/types/test_case_implementation_reference.py',
    'my-api/src/v_2/problem/types/void_function_definition_that_takes_actual_result.py',
    'my-api/src/submission/types/stack_information.py',
    'my-api/src/v_2/v_3/problem/types/create_problem_request_v_2.py',
    'my-api/src/submission/types/workspace_submission_update.py',
    'my-api/src/commons/types/debug_variable_value.py',
    'my-api/src/v_2/problem/types/basic_test_case_template.py',
    'my-api/src/v_2/problem/types/get_generated_test_case_template_file_request.py',
    'my-api/src/v_2/problem/types/test_case_implementation_reference.py',
    'my-api/src/submission/types/actual_result.py',
    'my-api/src/v_2/v_3/problem/types/non_void_function_definition.py',
    'my-api/src/commons/types/doubly_linked_list_value.py',
    'my-api/src/commons/types/binary_tree_node_value.py',
    'my-api/src/v_2/v_3/problem/types/lightweight_problem_info_v_2.py',
    'my-api/src/v_2/problem/types/custom_files.py',
    'my-api/src/problem/types/create_problem_response.py',
    'my-api/src/submission/types/exception_v_2.py',
    'my-api/src/admin/__init__.py',
    'my-api/src/submission/types/test_case_non_hidden_grade.py',
    'my-api/src/v_2/problem/__init__.py',
    'my-api/src/submission/types/submission_file_info.py',
    'my-api/src/commons/types/__init__.py',
    'my-api/src/playlist/__init__.py',
    'my-api/src/v_2/v_3/problem/types/basic_custom_files.py',
    'my-api/src/problem/types/problem_description_board.py',
    'my-api/src/submission/types/execution_session_status.py',
    'my-api/src/submission/types/running_response.py',
    'my-api/src/commons/types/doubly_linked_list_node_and_list_value.py',
    'my-api/src/submission/__init__.py',
    'my-api/src/submission/types/compile_error.py',
    'my-api/src/submission/types/test_case_hidden_grade.py',
    'my-api/src/submission/types/graded_test_case_update.py',
    'my-api/src/submission/types/traced_file.py',
    'my-api/src/v_2/v_3/problem/types/generated_files.py',
    'my-api/src/v_2/problem/types/test_case_implementation_description_board.py',
    'my-api/src/submission/types/running_submission_state.py',
    'my-api/src/submission/types/finished_response.py',
    'my-api/src/submission/types/lightweight_stackframe_information.py',
    'my-api/src/submission/types/workspace_run_details.py',
    'my-api/src/lang_server/types/__init__.py',
    'my-api/src/problem/types/update_problem_response.py',
    'my-api/src/submission/types/stderr_response.py',
    'my-api/src/v_2/v_3/problem/types/test_case_template_id.py',
    'my-api/src/migration/types/migration_status.py',
    'my-api/src/submission/types/internal_error.py',
    'my-api/src/submission/types/recorded_test_case_update.py',
    'my-api/src/submission/types/test_case_grade.py',
    'my-api/src/submission/types/test_case_result.py',
    'my-api/src/commons/types/variable_value.py',
    'my-api/src/commons/types/binary_tree_value.py',
    'my-api/src/commons/types/generic_value.py',
    'my-api/src/v_2/v_3/problem/types/parameter.py',
    'my-api/src/v_2/problem/types/void_function_signature_that_takes_actual_result.py',
    'my-api/src/v_2/problem/types/test_case_implementation.py',
    'my-api/src/problem/types/generic_create_problem_error.py',
    'my-api/src/problem/types/variable_type_and_name.py',
    'my-api/src/submission/types/get_trace_responses_page_request.py',
    'my-api/src/submission/types/test_case_result_with_stdout.py',
    'my-api/src/submission/types/unexpected_language_error.py',
    'my-api/src/v_2/problem/types/function_implementation_for_multiple_languages.py',
    'my-api/src/commons/types/map_value.py',
    'my-api/src/v_2/v_3/problem/types/assert_correctness_check.py',
    'my-api/src/v_2/problem/types/void_function_signature.py',
    'my-api/src/v_2/problem/types/non_void_function_definition.py',
    'my-api/src/submission/types/traced_test_case.py',
    'my-api/src/v_2/v_3/problem/types/function_implementation.py',
    'my-api/src/v_2/v_3/problem/types/non_void_function_signature.py',
    'my-api/src/v_2/v_3/problem/types/test_case_implementation_description.py',
    'my-api/src/problem/types/create_problem_request.py',
    'my-api/src/v_2/problem/types/function_implementation.py',
    'my-api/src/v_2/v_3/problem/types/default_provided_file.py',
    'my-api/src/submission/types/recorded_response_notification.py',
    'my-api/src/v_2/problem/types/function_signature.py',
    'my-api/src/v_2/v_3/problem/types/test_case_v_2.py',
    'my-api/src/v_2/v_3/problem/types/deep_equality_correctness_check.py',
    'my-api/src/v_2/v_3/problem/types/get_basic_solution_file_request.py',
    'my-api/src/problem/types/problem_files.py',
    'my-api/src/v_2/v_3/problem/types/test_case_metadata.py',
    'my-api/src/submission/types/recording_response_notification.py',
    'my-api/src/playlist/types/update_playlist_request.py',
    'my-api/src/submission/types/workspace_submission_status.py',
    'my-api/src/submission/types/test_submission_status.py',
    'my-api/src/v_2/v_3/problem/types/custom_files.py',
    'my-api/src/v_2/problem/types/default_provided_file.py',
    'my-api/src/v_2/v_3/problem/types/parameter_id.py',
    'my-api/src/submission/types/stack_frame.py',
    'my-api/src/commons/types/debug_key_value_pairs.py',
    'my-api/src/migration/types/migration.py',
    'my-api/src/submission/types/existing_submission_executing.py',
    'my-api/src/submission/types/workspace_traced_update.py',
    'my-api/src/submission/types/errored_response.py',
    'my-api/src/v_2/v_3/problem/types/get_generated_test_case_file_request.py',
    'my-api/src/v_2/v_3/__init__.py',
    'my-api/src/v_2/v_3/problem/types/void_function_definition.py',
    'my-api/src/v_2/v_3/problem/types/void_function_definition_that_takes_actual_result.py',
    'my-api/src/v_2/problem/types/test_case_implementation_description.py',
    'my-api/src/v_2/v_3/problem/types/files.py',
    'my-api/src/commons/types/key_value_pair.py',
    'my-api/src/v_2/problem/types/__init__.py',
    'my-api/src/v_2/problem/types/test_case_function.py',
    'my-api/src/submission/types/workspace_starter_files_response.py',
    'my-api/src/submission/types/workspace_files.py',
    'my-api/src/submission/types/submission_request.py',
    'my-api/src/submission/types/initialize_problem_request.py',
    'my-api/src/playlist/types/playlist_create_request.py',
    'my-api/src/admin/types/store_traced_workspace_request.py',
    'my-api/src/submission/types/workspace_submission_update_info.py',
    'my-api/src/v_2/problem/types/void_function_definition.py',
    'my-api/src/submission/types/building_executor_response.py',
    'my-api/src/submission/types/workspace_submission_state.py',
    'my-api/src/v_2/v_3/problem/types/test_case_template.py',
    'my-api/src/commons/types/problem_id.py',
    'my-api/src/commons/types/test_case.py',
    'my-api/src/v_2/v_3/problem/types/problem_info_v_2.py',
    'my-api/src/commons/types/list_type.py',
    'my-api/src/problem/types/problem_info.py',
    'my-api/src/v_2/v_3/problem/types/function_implementation_for_multiple_languages.py',
    'my-api/src/submission/types/submission_id.py',
    'my-api/src/commons/types/singly_linked_list_node_and_list_value.py',
    'my-api/src/v_2/v_3/problem/types/test_case_implementation_description_board.py',
    'my-api/src/v_2/v_3/problem/types/void_function_signature_that_takes_actual_result.py',
    'my-api/src/v_2/problem/types/problem_info_v_2.py',
    'my-api/src/playlist/types/playlist.py',
    'my-api/src/v_2/problem/types/get_generated_test_case_file_request.py',
    'my-api/src/v_2/problem/types/basic_custom_files.py',
    'my-api/src/v_2/problem/types/get_basic_solution_file_response.py',
    'my-api/src/problem/types/__init__.py',
    'my-api/src/lang_server/types/lang_server_response.py',
    'my-api/src/submission/types/execution_session_response.py',
    'my-api/src/v_2/problem/types/parameter.py',
    'my-api/src/submission/types/trace_response_v_2.py',
    'my-api/src/v_2/problem/types/create_problem_request_v_2.py',
    'my-api/src/admin/types/__init__.py',
    'my-api/src/v_2/problem/types/get_function_signature_response.py',
    'my-api/src/submission/types/trace_response.py',
    'my-api/src/v_2/v_3/problem/types/void_function_signature.py',
    'my-api/src/v_2/problem/types/test_case_id.py',
    'my-api/src/playlist/types/__init__.py',
    'my-api/src/submission/types/workspace_submission_status_v_2.py',
    'my-api/src/v_2/problem/types/files.py',
    'my-api/src/submission/types/terminated_response.py',
    'my-api/src/submission/types/submit_request_v_2.py',
    'my-api/src/submission/types/submission_status_v_2.py',
    'my-api/src/submission/types/test_submission_update.py',
    'my-api/src/commons/types/map_type.py',
    'my-api/src/v_2/problem/types/test_case_with_actual_result_implementation.py',
    'my-api/src/submission/types/test_submission_state.py',
    'my-api/src/submission/types/invalid_request_cause.py',
    'my-api/src/submission/types/test_submission_status_v_2.py',
    'my-api/src/v_2/problem/types/assert_correctness_check.py',
    'my-api/src/problem/types/get_default_starter_files_request.py',
    'my-api/src/commons/types/singly_linked_list_node_value.py',
    'my-api/src/v_2/problem/types/deep_equality_correctness_check.py',
    'my-api/src/submission/types/stdout_response.py',
    'my-api/src/commons/types/user_id.py',
    'my-api/src/commons/types/debug_map_value.py',
    'my-api/src/v_2/v_3/problem/types/__init__.py',
    'my-api/src/v_2/v_3/problem/types/file_info_v_2.py',
    'my-api/src/migration/types/__init__.py',
    'my-api/src/v_2/v_3/problem/__init__.py',
    'my-api/src/submission/types/submission_type_enum.py',
    'my-api/src/admin/types/store_traced_test_case_request.py',
    'my-api/src/submission/types/get_execution_session_state_response.py',
    'my-api/src/v_2/problem/types/generated_files.py',
    'my-api/src/v_2/problem/types/get_basic_solution_file_request.py',
    'my-api/src/v_2/v_3/problem/types/get_basic_solution_file_response.py',
    'my-api/src/v_2/problem/types/non_void_function_signature.py',
    'my-api/src/submission/types/submission_type_state.py',
    'my-api/src/lang_server/__init__.py',
    'my-api/src/submission/types/graded_response.py',
    'my-api/src/problem/types/get_default_starter_files_response.py',
    'my-api/src/submission/types/runtime_error.py',
    'my-api/src/v_2/v_3/problem/types/test_case_expects.py',
    'my-api/src/submission/types/trace_responses_page_v_2.py',
    'my-api/src/submission/types/error_info.py',
    'my-api/src/commons/types/language.py',
    'my-api/src/commons/types/node_id.py',
    'my-api/src/submission/types/submission_response.py',
    'my-api/src/submission/types/graded_response_v_2.py',
    'my-api/src/v_2/__init__.py'
])

snapshots['test_fastapi my-api_src___init__'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src___init__.py')

snapshots['test_fastapi my-api_src_admin___init__'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_admin___init__.py')

snapshots['test_fastapi my-api_src_admin_types___init__'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_admin_types___init__.py')

snapshots['test_fastapi my-api_src_admin_types_store_traced_test_case_request'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_admin_types_store_traced_test_case_request.py')

snapshots['test_fastapi my-api_src_admin_types_store_traced_workspace_request'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_admin_types_store_traced_workspace_request.py')

snapshots['test_fastapi my-api_src_commons___init__'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_commons___init__.py')

snapshots['test_fastapi my-api_src_commons_types___init__'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_commons_types___init__.py')

snapshots['test_fastapi my-api_src_commons_types_binary_tree_node_and_tree_value'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_commons_types_binary_tree_node_and_tree_value.py')

snapshots['test_fastapi my-api_src_commons_types_binary_tree_node_value'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_commons_types_binary_tree_node_value.py')

snapshots['test_fastapi my-api_src_commons_types_binary_tree_value'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_commons_types_binary_tree_value.py')

snapshots['test_fastapi my-api_src_commons_types_debug_key_value_pairs'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_commons_types_debug_key_value_pairs.py')

snapshots['test_fastapi my-api_src_commons_types_debug_map_value'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_commons_types_debug_map_value.py')

snapshots['test_fastapi my-api_src_commons_types_debug_variable_value'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_commons_types_debug_variable_value.py')

snapshots['test_fastapi my-api_src_commons_types_doubly_linked_list_node_and_list_value'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_commons_types_doubly_linked_list_node_and_list_value.py')

snapshots['test_fastapi my-api_src_commons_types_doubly_linked_list_node_value'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_commons_types_doubly_linked_list_node_value.py')

snapshots['test_fastapi my-api_src_commons_types_doubly_linked_list_value'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_commons_types_doubly_linked_list_value.py')

snapshots['test_fastapi my-api_src_commons_types_file_info'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_commons_types_file_info.py')

snapshots['test_fastapi my-api_src_commons_types_generic_value'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_commons_types_generic_value.py')

snapshots['test_fastapi my-api_src_commons_types_key_value_pair'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_commons_types_key_value_pair.py')

snapshots['test_fastapi my-api_src_commons_types_language'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_commons_types_language.py')

snapshots['test_fastapi my-api_src_commons_types_list_type'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_commons_types_list_type.py')

snapshots['test_fastapi my-api_src_commons_types_map_type'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_commons_types_map_type.py')

snapshots['test_fastapi my-api_src_commons_types_map_value'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_commons_types_map_value.py')

snapshots['test_fastapi my-api_src_commons_types_node_id'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_commons_types_node_id.py')

snapshots['test_fastapi my-api_src_commons_types_problem_id'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_commons_types_problem_id.py')

snapshots['test_fastapi my-api_src_commons_types_singly_linked_list_node_and_list_value'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_commons_types_singly_linked_list_node_and_list_value.py')

snapshots['test_fastapi my-api_src_commons_types_singly_linked_list_node_value'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_commons_types_singly_linked_list_node_value.py')

snapshots['test_fastapi my-api_src_commons_types_singly_linked_list_value'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_commons_types_singly_linked_list_value.py')

snapshots['test_fastapi my-api_src_commons_types_test_case'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_commons_types_test_case.py')

snapshots['test_fastapi my-api_src_commons_types_test_case_with_expected_result'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_commons_types_test_case_with_expected_result.py')

snapshots['test_fastapi my-api_src_commons_types_user_id'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_commons_types_user_id.py')

snapshots['test_fastapi my-api_src_commons_types_variable_type'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_commons_types_variable_type.py')

snapshots['test_fastapi my-api_src_commons_types_variable_value'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_commons_types_variable_value.py')

snapshots['test_fastapi my-api_src_lang_server___init__'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_lang_server___init__.py')

snapshots['test_fastapi my-api_src_lang_server_types___init__'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_lang_server_types___init__.py')

snapshots['test_fastapi my-api_src_lang_server_types_lang_server_request'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_lang_server_types_lang_server_request.py')

snapshots['test_fastapi my-api_src_lang_server_types_lang_server_response'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_lang_server_types_lang_server_response.py')

snapshots['test_fastapi my-api_src_migration___init__'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_migration___init__.py')

snapshots['test_fastapi my-api_src_migration_types___init__'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_migration_types___init__.py')

snapshots['test_fastapi my-api_src_migration_types_migration'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_migration_types_migration.py')

snapshots['test_fastapi my-api_src_migration_types_migration_status'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_migration_types_migration_status.py')

snapshots['test_fastapi my-api_src_playlist___init__'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_playlist___init__.py')

snapshots['test_fastapi my-api_src_playlist_types___init__'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_playlist_types___init__.py')

snapshots['test_fastapi my-api_src_playlist_types_playlist'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_playlist_types_playlist.py')

snapshots['test_fastapi my-api_src_playlist_types_playlist_create_request'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_playlist_types_playlist_create_request.py')

snapshots['test_fastapi my-api_src_playlist_types_playlist_id'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_playlist_types_playlist_id.py')

snapshots['test_fastapi my-api_src_playlist_types_update_playlist_request'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_playlist_types_update_playlist_request.py')

snapshots['test_fastapi my-api_src_problem___init__'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_problem___init__.py')

snapshots['test_fastapi my-api_src_problem_types___init__'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_problem_types___init__.py')

snapshots['test_fastapi my-api_src_problem_types_create_problem_error'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_problem_types_create_problem_error.py')

snapshots['test_fastapi my-api_src_problem_types_create_problem_request'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_problem_types_create_problem_request.py')

snapshots['test_fastapi my-api_src_problem_types_create_problem_response'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_problem_types_create_problem_response.py')

snapshots['test_fastapi my-api_src_problem_types_generic_create_problem_error'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_problem_types_generic_create_problem_error.py')

snapshots['test_fastapi my-api_src_problem_types_get_default_starter_files_request'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_problem_types_get_default_starter_files_request.py')

snapshots['test_fastapi my-api_src_problem_types_get_default_starter_files_response'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_problem_types_get_default_starter_files_response.py')

snapshots['test_fastapi my-api_src_problem_types_problem_description'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_problem_types_problem_description.py')

snapshots['test_fastapi my-api_src_problem_types_problem_description_board'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_problem_types_problem_description_board.py')

snapshots['test_fastapi my-api_src_problem_types_problem_files'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_problem_types_problem_files.py')

snapshots['test_fastapi my-api_src_problem_types_problem_info'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_problem_types_problem_info.py')

snapshots['test_fastapi my-api_src_problem_types_update_problem_response'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_problem_types_update_problem_response.py')

snapshots['test_fastapi my-api_src_problem_types_variable_type_and_name'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_problem_types_variable_type_and_name.py')

snapshots['test_fastapi my-api_src_submission___init__'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission___init__.py')

snapshots['test_fastapi my-api_src_submission_types___init__'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types___init__.py')

snapshots['test_fastapi my-api_src_submission_types_actual_result'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_actual_result.py')

snapshots['test_fastapi my-api_src_submission_types_building_executor_response'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_building_executor_response.py')

snapshots['test_fastapi my-api_src_submission_types_code_execution_update'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_code_execution_update.py')

snapshots['test_fastapi my-api_src_submission_types_compile_error'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_compile_error.py')

snapshots['test_fastapi my-api_src_submission_types_custom_test_cases_unsupported'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_custom_test_cases_unsupported.py')

snapshots['test_fastapi my-api_src_submission_types_error_info'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_error_info.py')

snapshots['test_fastapi my-api_src_submission_types_errored_response'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_errored_response.py')

snapshots['test_fastapi my-api_src_submission_types_exception_info'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_exception_info.py')

snapshots['test_fastapi my-api_src_submission_types_exception_v_2'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_exception_v_2.py')

snapshots['test_fastapi my-api_src_submission_types_execution_session_response'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_execution_session_response.py')

snapshots['test_fastapi my-api_src_submission_types_execution_session_state'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_execution_session_state.py')

snapshots['test_fastapi my-api_src_submission_types_execution_session_status'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_execution_session_status.py')

snapshots['test_fastapi my-api_src_submission_types_existing_submission_executing'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_existing_submission_executing.py')

snapshots['test_fastapi my-api_src_submission_types_expression_location'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_expression_location.py')

snapshots['test_fastapi my-api_src_submission_types_finished_response'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_finished_response.py')

snapshots['test_fastapi my-api_src_submission_types_get_execution_session_state_response'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_get_execution_session_state_response.py')

snapshots['test_fastapi my-api_src_submission_types_get_submission_state_response'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_get_submission_state_response.py')

snapshots['test_fastapi my-api_src_submission_types_get_trace_responses_page_request'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_get_trace_responses_page_request.py')

snapshots['test_fastapi my-api_src_submission_types_graded_response'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_graded_response.py')

snapshots['test_fastapi my-api_src_submission_types_graded_response_v_2'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_graded_response_v_2.py')

snapshots['test_fastapi my-api_src_submission_types_graded_test_case_update'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_graded_test_case_update.py')

snapshots['test_fastapi my-api_src_submission_types_initialize_problem_request'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_initialize_problem_request.py')

snapshots['test_fastapi my-api_src_submission_types_internal_error'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_internal_error.py')

snapshots['test_fastapi my-api_src_submission_types_invalid_request_cause'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_invalid_request_cause.py')

snapshots['test_fastapi my-api_src_submission_types_invalid_request_response'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_invalid_request_response.py')

snapshots['test_fastapi my-api_src_submission_types_lightweight_stackframe_information'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_lightweight_stackframe_information.py')

snapshots['test_fastapi my-api_src_submission_types_recorded_response_notification'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_recorded_response_notification.py')

snapshots['test_fastapi my-api_src_submission_types_recorded_test_case_update'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_recorded_test_case_update.py')

snapshots['test_fastapi my-api_src_submission_types_recording_response_notification'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_recording_response_notification.py')

snapshots['test_fastapi my-api_src_submission_types_running_response'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_running_response.py')

snapshots['test_fastapi my-api_src_submission_types_running_submission_state'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_running_submission_state.py')

snapshots['test_fastapi my-api_src_submission_types_runtime_error'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_runtime_error.py')

snapshots['test_fastapi my-api_src_submission_types_scope'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_scope.py')

snapshots['test_fastapi my-api_src_submission_types_share_id'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_share_id.py')

snapshots['test_fastapi my-api_src_submission_types_stack_frame'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_stack_frame.py')

snapshots['test_fastapi my-api_src_submission_types_stack_information'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_stack_information.py')

snapshots['test_fastapi my-api_src_submission_types_stderr_response'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_stderr_response.py')

snapshots['test_fastapi my-api_src_submission_types_stdout_response'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_stdout_response.py')

snapshots['test_fastapi my-api_src_submission_types_stop_request'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_stop_request.py')

snapshots['test_fastapi my-api_src_submission_types_stopped_response'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_stopped_response.py')

snapshots['test_fastapi my-api_src_submission_types_submission_file_info'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_submission_file_info.py')

snapshots['test_fastapi my-api_src_submission_types_submission_id'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_submission_id.py')

snapshots['test_fastapi my-api_src_submission_types_submission_id_not_found'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_submission_id_not_found.py')

snapshots['test_fastapi my-api_src_submission_types_submission_request'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_submission_request.py')

snapshots['test_fastapi my-api_src_submission_types_submission_response'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_submission_response.py')

snapshots['test_fastapi my-api_src_submission_types_submission_status_for_test_case'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_submission_status_for_test_case.py')

snapshots['test_fastapi my-api_src_submission_types_submission_status_v_2'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_submission_status_v_2.py')

snapshots['test_fastapi my-api_src_submission_types_submission_type_enum'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_submission_type_enum.py')

snapshots['test_fastapi my-api_src_submission_types_submission_type_state'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_submission_type_state.py')

snapshots['test_fastapi my-api_src_submission_types_submit_request_v_2'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_submit_request_v_2.py')

snapshots['test_fastapi my-api_src_submission_types_terminated_response'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_terminated_response.py')

snapshots['test_fastapi my-api_src_submission_types_test_case_grade'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_test_case_grade.py')

snapshots['test_fastapi my-api_src_submission_types_test_case_hidden_grade'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_test_case_hidden_grade.py')

snapshots['test_fastapi my-api_src_submission_types_test_case_non_hidden_grade'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_test_case_non_hidden_grade.py')

snapshots['test_fastapi my-api_src_submission_types_test_case_result'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_test_case_result.py')

snapshots['test_fastapi my-api_src_submission_types_test_case_result_with_stdout'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_test_case_result_with_stdout.py')

snapshots['test_fastapi my-api_src_submission_types_test_submission_state'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_test_submission_state.py')

snapshots['test_fastapi my-api_src_submission_types_test_submission_status'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_test_submission_status.py')

snapshots['test_fastapi my-api_src_submission_types_test_submission_status_v_2'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_test_submission_status_v_2.py')

snapshots['test_fastapi my-api_src_submission_types_test_submission_update'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_test_submission_update.py')

snapshots['test_fastapi my-api_src_submission_types_test_submission_update_info'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_test_submission_update_info.py')

snapshots['test_fastapi my-api_src_submission_types_trace_response'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_trace_response.py')

snapshots['test_fastapi my-api_src_submission_types_trace_response_v_2'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_trace_response_v_2.py')

snapshots['test_fastapi my-api_src_submission_types_trace_responses_page'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_trace_responses_page.py')

snapshots['test_fastapi my-api_src_submission_types_trace_responses_page_v_2'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_trace_responses_page_v_2.py')

snapshots['test_fastapi my-api_src_submission_types_traced_file'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_traced_file.py')

snapshots['test_fastapi my-api_src_submission_types_traced_test_case'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_traced_test_case.py')

snapshots['test_fastapi my-api_src_submission_types_unexpected_language_error'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_unexpected_language_error.py')

snapshots['test_fastapi my-api_src_submission_types_workspace_files'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_workspace_files.py')

snapshots['test_fastapi my-api_src_submission_types_workspace_ran_response'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_workspace_ran_response.py')

snapshots['test_fastapi my-api_src_submission_types_workspace_run_details'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_workspace_run_details.py')

snapshots['test_fastapi my-api_src_submission_types_workspace_starter_files_response'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_workspace_starter_files_response.py')

snapshots['test_fastapi my-api_src_submission_types_workspace_starter_files_response_v_2'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_workspace_starter_files_response_v_2.py')

snapshots['test_fastapi my-api_src_submission_types_workspace_submission_state'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_workspace_submission_state.py')

snapshots['test_fastapi my-api_src_submission_types_workspace_submission_status'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_workspace_submission_status.py')

snapshots['test_fastapi my-api_src_submission_types_workspace_submission_status_v_2'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_workspace_submission_status_v_2.py')

snapshots['test_fastapi my-api_src_submission_types_workspace_submission_update'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_workspace_submission_update.py')

snapshots['test_fastapi my-api_src_submission_types_workspace_submission_update_info'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_workspace_submission_update_info.py')

snapshots['test_fastapi my-api_src_submission_types_workspace_submit_request'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_workspace_submit_request.py')

snapshots['test_fastapi my-api_src_submission_types_workspace_traced_update'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_submission_types_workspace_traced_update.py')

snapshots['test_fastapi my-api_src_v_2___init__'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2___init__.py')

snapshots['test_fastapi my-api_src_v_2_problem___init__'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_problem___init__.py')

snapshots['test_fastapi my-api_src_v_2_problem_types___init__'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_problem_types___init__.py')

snapshots['test_fastapi my-api_src_v_2_problem_types_assert_correctness_check'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_problem_types_assert_correctness_check.py')

snapshots['test_fastapi my-api_src_v_2_problem_types_basic_custom_files'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_problem_types_basic_custom_files.py')

snapshots['test_fastapi my-api_src_v_2_problem_types_basic_test_case_template'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_problem_types_basic_test_case_template.py')

snapshots['test_fastapi my-api_src_v_2_problem_types_create_problem_request_v_2'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_problem_types_create_problem_request_v_2.py')

snapshots['test_fastapi my-api_src_v_2_problem_types_custom_files'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_problem_types_custom_files.py')

snapshots['test_fastapi my-api_src_v_2_problem_types_deep_equality_correctness_check'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_problem_types_deep_equality_correctness_check.py')

snapshots['test_fastapi my-api_src_v_2_problem_types_default_provided_file'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_problem_types_default_provided_file.py')

snapshots['test_fastapi my-api_src_v_2_problem_types_file_info_v_2'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_problem_types_file_info_v_2.py')

snapshots['test_fastapi my-api_src_v_2_problem_types_files'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_problem_types_files.py')

snapshots['test_fastapi my-api_src_v_2_problem_types_function_implementation'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_problem_types_function_implementation.py')

snapshots['test_fastapi my-api_src_v_2_problem_types_function_implementation_for_multiple_languages'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_problem_types_function_implementation_for_multiple_languages.py')

snapshots['test_fastapi my-api_src_v_2_problem_types_function_signature'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_problem_types_function_signature.py')

snapshots['test_fastapi my-api_src_v_2_problem_types_generated_files'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_problem_types_generated_files.py')

snapshots['test_fastapi my-api_src_v_2_problem_types_get_basic_solution_file_request'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_problem_types_get_basic_solution_file_request.py')

snapshots['test_fastapi my-api_src_v_2_problem_types_get_basic_solution_file_response'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_problem_types_get_basic_solution_file_response.py')

snapshots['test_fastapi my-api_src_v_2_problem_types_get_function_signature_request'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_problem_types_get_function_signature_request.py')

snapshots['test_fastapi my-api_src_v_2_problem_types_get_function_signature_response'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_problem_types_get_function_signature_response.py')

snapshots['test_fastapi my-api_src_v_2_problem_types_get_generated_test_case_file_request'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_problem_types_get_generated_test_case_file_request.py')

snapshots['test_fastapi my-api_src_v_2_problem_types_get_generated_test_case_template_file_request'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_problem_types_get_generated_test_case_template_file_request.py')

snapshots['test_fastapi my-api_src_v_2_problem_types_lightweight_problem_info_v_2'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_problem_types_lightweight_problem_info_v_2.py')

snapshots['test_fastapi my-api_src_v_2_problem_types_non_void_function_definition'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_problem_types_non_void_function_definition.py')

snapshots['test_fastapi my-api_src_v_2_problem_types_non_void_function_signature'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_problem_types_non_void_function_signature.py')

snapshots['test_fastapi my-api_src_v_2_problem_types_parameter'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_problem_types_parameter.py')

snapshots['test_fastapi my-api_src_v_2_problem_types_parameter_id'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_problem_types_parameter_id.py')

snapshots['test_fastapi my-api_src_v_2_problem_types_problem_info_v_2'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_problem_types_problem_info_v_2.py')

snapshots['test_fastapi my-api_src_v_2_problem_types_test_case_expects'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_problem_types_test_case_expects.py')

snapshots['test_fastapi my-api_src_v_2_problem_types_test_case_function'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_problem_types_test_case_function.py')

snapshots['test_fastapi my-api_src_v_2_problem_types_test_case_id'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_problem_types_test_case_id.py')

snapshots['test_fastapi my-api_src_v_2_problem_types_test_case_implementation'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_problem_types_test_case_implementation.py')

snapshots['test_fastapi my-api_src_v_2_problem_types_test_case_implementation_description'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_problem_types_test_case_implementation_description.py')

snapshots['test_fastapi my-api_src_v_2_problem_types_test_case_implementation_description_board'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_problem_types_test_case_implementation_description_board.py')

snapshots['test_fastapi my-api_src_v_2_problem_types_test_case_implementation_reference'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_problem_types_test_case_implementation_reference.py')

snapshots['test_fastapi my-api_src_v_2_problem_types_test_case_metadata'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_problem_types_test_case_metadata.py')

snapshots['test_fastapi my-api_src_v_2_problem_types_test_case_template'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_problem_types_test_case_template.py')

snapshots['test_fastapi my-api_src_v_2_problem_types_test_case_template_id'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_problem_types_test_case_template_id.py')

snapshots['test_fastapi my-api_src_v_2_problem_types_test_case_v_2'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_problem_types_test_case_v_2.py')

snapshots['test_fastapi my-api_src_v_2_problem_types_test_case_with_actual_result_implementation'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_problem_types_test_case_with_actual_result_implementation.py')

snapshots['test_fastapi my-api_src_v_2_problem_types_void_function_definition'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_problem_types_void_function_definition.py')

snapshots['test_fastapi my-api_src_v_2_problem_types_void_function_definition_that_takes_actual_result'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_problem_types_void_function_definition_that_takes_actual_result.py')

snapshots['test_fastapi my-api_src_v_2_problem_types_void_function_signature'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_problem_types_void_function_signature.py')

snapshots['test_fastapi my-api_src_v_2_problem_types_void_function_signature_that_takes_actual_result'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_problem_types_void_function_signature_that_takes_actual_result.py')

snapshots['test_fastapi my-api_src_v_2_v_3___init__'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_v_3___init__.py')

snapshots['test_fastapi my-api_src_v_2_v_3_problem___init__'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_v_3_problem___init__.py')

snapshots['test_fastapi my-api_src_v_2_v_3_problem_types___init__'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_v_3_problem_types___init__.py')

snapshots['test_fastapi my-api_src_v_2_v_3_problem_types_assert_correctness_check'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_v_3_problem_types_assert_correctness_check.py')

snapshots['test_fastapi my-api_src_v_2_v_3_problem_types_basic_custom_files'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_v_3_problem_types_basic_custom_files.py')

snapshots['test_fastapi my-api_src_v_2_v_3_problem_types_basic_test_case_template'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_v_3_problem_types_basic_test_case_template.py')

snapshots['test_fastapi my-api_src_v_2_v_3_problem_types_create_problem_request_v_2'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_v_3_problem_types_create_problem_request_v_2.py')

snapshots['test_fastapi my-api_src_v_2_v_3_problem_types_custom_files'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_v_3_problem_types_custom_files.py')

snapshots['test_fastapi my-api_src_v_2_v_3_problem_types_deep_equality_correctness_check'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_v_3_problem_types_deep_equality_correctness_check.py')

snapshots['test_fastapi my-api_src_v_2_v_3_problem_types_default_provided_file'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_v_3_problem_types_default_provided_file.py')

snapshots['test_fastapi my-api_src_v_2_v_3_problem_types_file_info_v_2'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_v_3_problem_types_file_info_v_2.py')

snapshots['test_fastapi my-api_src_v_2_v_3_problem_types_files'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_v_3_problem_types_files.py')

snapshots['test_fastapi my-api_src_v_2_v_3_problem_types_function_implementation'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_v_3_problem_types_function_implementation.py')

snapshots['test_fastapi my-api_src_v_2_v_3_problem_types_function_implementation_for_multiple_languages'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_v_3_problem_types_function_implementation_for_multiple_languages.py')

snapshots['test_fastapi my-api_src_v_2_v_3_problem_types_function_signature'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_v_3_problem_types_function_signature.py')

snapshots['test_fastapi my-api_src_v_2_v_3_problem_types_generated_files'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_v_3_problem_types_generated_files.py')

snapshots['test_fastapi my-api_src_v_2_v_3_problem_types_get_basic_solution_file_request'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_v_3_problem_types_get_basic_solution_file_request.py')

snapshots['test_fastapi my-api_src_v_2_v_3_problem_types_get_basic_solution_file_response'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_v_3_problem_types_get_basic_solution_file_response.py')

snapshots['test_fastapi my-api_src_v_2_v_3_problem_types_get_function_signature_request'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_v_3_problem_types_get_function_signature_request.py')

snapshots['test_fastapi my-api_src_v_2_v_3_problem_types_get_function_signature_response'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_v_3_problem_types_get_function_signature_response.py')

snapshots['test_fastapi my-api_src_v_2_v_3_problem_types_get_generated_test_case_file_request'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_v_3_problem_types_get_generated_test_case_file_request.py')

snapshots['test_fastapi my-api_src_v_2_v_3_problem_types_get_generated_test_case_template_file_request'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_v_3_problem_types_get_generated_test_case_template_file_request.py')

snapshots['test_fastapi my-api_src_v_2_v_3_problem_types_lightweight_problem_info_v_2'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_v_3_problem_types_lightweight_problem_info_v_2.py')

snapshots['test_fastapi my-api_src_v_2_v_3_problem_types_non_void_function_definition'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_v_3_problem_types_non_void_function_definition.py')

snapshots['test_fastapi my-api_src_v_2_v_3_problem_types_non_void_function_signature'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_v_3_problem_types_non_void_function_signature.py')

snapshots['test_fastapi my-api_src_v_2_v_3_problem_types_parameter'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_v_3_problem_types_parameter.py')

snapshots['test_fastapi my-api_src_v_2_v_3_problem_types_parameter_id'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_v_3_problem_types_parameter_id.py')

snapshots['test_fastapi my-api_src_v_2_v_3_problem_types_problem_info_v_2'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_v_3_problem_types_problem_info_v_2.py')

snapshots['test_fastapi my-api_src_v_2_v_3_problem_types_test_case_expects'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_v_3_problem_types_test_case_expects.py')

snapshots['test_fastapi my-api_src_v_2_v_3_problem_types_test_case_function'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_v_3_problem_types_test_case_function.py')

snapshots['test_fastapi my-api_src_v_2_v_3_problem_types_test_case_id'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_v_3_problem_types_test_case_id.py')

snapshots['test_fastapi my-api_src_v_2_v_3_problem_types_test_case_implementation'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_v_3_problem_types_test_case_implementation.py')

snapshots['test_fastapi my-api_src_v_2_v_3_problem_types_test_case_implementation_description'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_v_3_problem_types_test_case_implementation_description.py')

snapshots['test_fastapi my-api_src_v_2_v_3_problem_types_test_case_implementation_description_board'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_v_3_problem_types_test_case_implementation_description_board.py')

snapshots['test_fastapi my-api_src_v_2_v_3_problem_types_test_case_implementation_reference'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_v_3_problem_types_test_case_implementation_reference.py')

snapshots['test_fastapi my-api_src_v_2_v_3_problem_types_test_case_metadata'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_v_3_problem_types_test_case_metadata.py')

snapshots['test_fastapi my-api_src_v_2_v_3_problem_types_test_case_template'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_v_3_problem_types_test_case_template.py')

snapshots['test_fastapi my-api_src_v_2_v_3_problem_types_test_case_template_id'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_v_3_problem_types_test_case_template_id.py')

snapshots['test_fastapi my-api_src_v_2_v_3_problem_types_test_case_v_2'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_v_3_problem_types_test_case_v_2.py')

snapshots['test_fastapi my-api_src_v_2_v_3_problem_types_test_case_with_actual_result_implementation'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_v_3_problem_types_test_case_with_actual_result_implementation.py')

snapshots['test_fastapi my-api_src_v_2_v_3_problem_types_void_function_definition'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_v_3_problem_types_void_function_definition.py')

snapshots['test_fastapi my-api_src_v_2_v_3_problem_types_void_function_definition_that_takes_actual_result'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_v_3_problem_types_void_function_definition_that_takes_actual_result.py')

snapshots['test_fastapi my-api_src_v_2_v_3_problem_types_void_function_signature'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_v_3_problem_types_void_function_signature.py')

snapshots['test_fastapi my-api_src_v_2_v_3_problem_types_void_function_signature_that_takes_actual_result'] = FileSnapshot('snap_test_fastapi/test_fastapi my-api_src_v_2_v_3_problem_types_void_function_signature_that_takes_actual_result.py')
