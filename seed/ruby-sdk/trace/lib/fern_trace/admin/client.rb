# frozen_string_literal: true

require_relative "../../requests"
require_relative "../submission/types/test_submission_status"
require_relative "../submission/types/test_submission_update"
require_relative "../submission/types/workspace_submission_status"
require_relative "../submission/types/workspace_submission_update"
require_relative "../submission/types/test_case_result_with_stdout"
require_relative "../submission/types/trace_response"
require_relative "../submission/types/trace_response_v_2"
require_relative "../submission/types/workspace_run_details"
require "async"

module SeedTraceClient
  class AdminClient
    # @return [SeedTraceClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedTraceClient::RequestClient]
    # @return [SeedTraceClient::AdminClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param submission_id [String]
    # @param request [SeedTraceClient::Submission::TestSubmissionStatus]
    # @param request_options [SeedTraceClient::RequestOptions]
    # @return [Void]
    # @example
    #  trace = SeedTraceClient::Client.new(
    #    base_url: "https://api.example.com",
    #    environment: SeedTraceClient::Environment::PROD,
    #    token: "YOUR_AUTH_TOKEN"
    #  )
    #  trace.admin.update_test_submission_status(submission_id: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")
    def update_test_submission_status(submission_id:, request:, request_options: nil)
      @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/admin/store-test-submission-status/#{submission_id}"
      end
    end

    # @param submission_id [String]
    # @param request [Hash] Request of type SeedTraceClient::Submission::TestSubmissionUpdate, as a Hash
    #   * :update_time (DateTime)
    #   * :update_info (Hash)
    # @param request_options [SeedTraceClient::RequestOptions]
    # @return [Void]
    # @example
    #  trace = SeedTraceClient::Client.new(
    #    base_url: "https://api.example.com",
    #    environment: SeedTraceClient::Environment::PROD,
    #    token: "YOUR_AUTH_TOKEN"
    #  )
    #  trace.admin.send_test_submission_update(submission_id: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32", request: { update_time: DateTime.parse("2024-01-15T09:30:00.000Z") })
    def send_test_submission_update(submission_id:, request:, request_options: nil)
      @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/admin/store-test-submission-status-v2/#{submission_id}"
      end
    end

    # @param submission_id [String]
    # @param request [SeedTraceClient::Submission::WorkspaceSubmissionStatus]
    # @param request_options [SeedTraceClient::RequestOptions]
    # @return [Void]
    # @example
    #  trace = SeedTraceClient::Client.new(
    #    base_url: "https://api.example.com",
    #    environment: SeedTraceClient::Environment::PROD,
    #    token: "YOUR_AUTH_TOKEN"
    #  )
    #  trace.admin.update_workspace_submission_status(submission_id: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")
    def update_workspace_submission_status(submission_id:, request:, request_options: nil)
      @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/admin/store-workspace-submission-status/#{submission_id}"
      end
    end

    # @param submission_id [String]
    # @param request [Hash] Request of type SeedTraceClient::Submission::WorkspaceSubmissionUpdate, as a Hash
    #   * :update_time (DateTime)
    #   * :update_info (Hash)
    # @param request_options [SeedTraceClient::RequestOptions]
    # @return [Void]
    # @example
    #  trace = SeedTraceClient::Client.new(
    #    base_url: "https://api.example.com",
    #    environment: SeedTraceClient::Environment::PROD,
    #    token: "YOUR_AUTH_TOKEN"
    #  )
    #  trace.admin.send_workspace_submission_update(submission_id: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32", request: { update_time: DateTime.parse("2024-01-15T09:30:00.000Z") })
    def send_workspace_submission_update(submission_id:, request:, request_options: nil)
      @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/admin/store-workspace-submission-status-v2/#{submission_id}"
      end
    end

    # @param submission_id [String]
    # @param test_case_id [String]
    # @param result [Hash] Request of type SeedTraceClient::Submission::TestCaseResultWithStdout, as a Hash
    #   * :result (Hash)
    #     * :expected_result (Hash)
    #     * :actual_result (Hash)
    #     * :passed (Boolean)
    #   * :stdout (String)
    # @param trace_responses [Array<Hash>] Request of type Array<SeedTraceClient::Submission::TraceResponse>, as a Hash
    #   * :submission_id (String)
    #   * :line_number (Integer)
    #   * :return_value (Hash)
    #   * :expression_location (Hash)
    #     * :start (Integer)
    #     * :offset (Integer)
    #   * :stack (Hash)
    #     * :num_stack_frames (Integer)
    #     * :top_stack_frame (Hash)
    #       * :method_name (String)
    #       * :line_number (Integer)
    #       * :scopes (Array<SeedTraceClient::Submission::Scope>)
    #   * :stdout (String)
    # @param request_options [SeedTraceClient::RequestOptions]
    # @return [Void]
    # @example
    #  trace = SeedTraceClient::Client.new(
    #    base_url: "https://api.example.com",
    #    environment: SeedTraceClient::Environment::PROD,
    #    token: "YOUR_AUTH_TOKEN"
    #  )
    #  trace.admin.store_traced_test_case(
    #    submission_id: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    #    test_case_id: "testCaseId",
    #    result: { result: { passed: true }, stdout: "stdout" },
    #    trace_responses: [{ submission_id: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32", line_number: 1, expression_location: { start: 1, offset: 1 }, stack: { num_stack_frames: 1, top_stack_frame: { method_name: "methodName", line_number: 1, scopes: [{ variables: { "variables": undefined } }, { variables: { "variables": undefined } }] } }, stdout: "stdout" }, { submission_id: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32", line_number: 1, expression_location: { start: 1, offset: 1 }, stack: { num_stack_frames: 1, top_stack_frame: { method_name: "methodName", line_number: 1, scopes: [{ variables: { "variables": undefined } }, { variables: { "variables": undefined } }] } }, stdout: "stdout" }]
    #  )
    def store_traced_test_case(submission_id:, test_case_id:, result:, trace_responses:, request_options: nil)
      @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        req.body = {
          **(request_options&.additional_body_parameters || {}),
          result: result,
          traceResponses: trace_responses
        }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/admin/store-test-trace/submission/#{submission_id}/testCase/#{test_case_id}"
      end
    end

    # @param submission_id [String]
    # @param test_case_id [String]
    # @param request [Array<Hash>] Request of type Array<SeedTraceClient::Submission::TraceResponseV2>, as a Hash
    #   * :submission_id (String)
    #   * :line_number (Integer)
    #   * :file (Hash)
    #     * :filename (String)
    #     * :directory (String)
    #   * :return_value (Hash)
    #   * :expression_location (Hash)
    #     * :start (Integer)
    #     * :offset (Integer)
    #   * :stack (Hash)
    #     * :num_stack_frames (Integer)
    #     * :top_stack_frame (Hash)
    #       * :method_name (String)
    #       * :line_number (Integer)
    #       * :scopes (Array<SeedTraceClient::Submission::Scope>)
    #   * :stdout (String)
    # @param request_options [SeedTraceClient::RequestOptions]
    # @return [Void]
    # @example
    #  trace = SeedTraceClient::Client.new(
    #    base_url: "https://api.example.com",
    #    environment: SeedTraceClient::Environment::PROD,
    #    token: "YOUR_AUTH_TOKEN"
    #  )
    #  trace.admin.store_traced_test_case_v_2(
    #    submission_id: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    #    test_case_id: "testCaseId",
    #    request: [{ submission_id: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32", line_number: 1, file: { filename: "filename", directory: "directory" }, expression_location: { start: 1, offset: 1 }, stack: { num_stack_frames: 1, top_stack_frame: { method_name: "methodName", line_number: 1, scopes: [{ variables: { "variables": undefined } }, { variables: { "variables": undefined } }] } }, stdout: "stdout" }, { submission_id: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32", line_number: 1, file: { filename: "filename", directory: "directory" }, expression_location: { start: 1, offset: 1 }, stack: { num_stack_frames: 1, top_stack_frame: { method_name: "methodName", line_number: 1, scopes: [{ variables: { "variables": undefined } }, { variables: { "variables": undefined } }] } }, stdout: "stdout" }]
    #  )
    def store_traced_test_case_v_2(submission_id:, test_case_id:, request:, request_options: nil)
      @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/admin/store-test-trace-v2/submission/#{submission_id}/testCase/#{test_case_id}"
      end
    end

    # @param submission_id [String]
    # @param workspace_run_details [Hash] Request of type SeedTraceClient::Submission::WorkspaceRunDetails, as a Hash
    #   * :exception_v_2 (Hash)
    #   * :exception (Hash)
    #     * :exception_type (String)
    #     * :exception_message (String)
    #     * :exception_stacktrace (String)
    #   * :stdout (String)
    # @param trace_responses [Array<Hash>] Request of type Array<SeedTraceClient::Submission::TraceResponse>, as a Hash
    #   * :submission_id (String)
    #   * :line_number (Integer)
    #   * :return_value (Hash)
    #   * :expression_location (Hash)
    #     * :start (Integer)
    #     * :offset (Integer)
    #   * :stack (Hash)
    #     * :num_stack_frames (Integer)
    #     * :top_stack_frame (Hash)
    #       * :method_name (String)
    #       * :line_number (Integer)
    #       * :scopes (Array<SeedTraceClient::Submission::Scope>)
    #   * :stdout (String)
    # @param request_options [SeedTraceClient::RequestOptions]
    # @return [Void]
    # @example
    #  trace = SeedTraceClient::Client.new(
    #    base_url: "https://api.example.com",
    #    environment: SeedTraceClient::Environment::PROD,
    #    token: "YOUR_AUTH_TOKEN"
    #  )
    #  trace.admin.store_traced_workspace(
    #    submission_id: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    #    workspace_run_details: { exception: { exception_type: "exceptionType", exception_message: "exceptionMessage", exception_stacktrace: "exceptionStacktrace" }, stdout: "stdout" },
    #    trace_responses: [{ submission_id: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32", line_number: 1, expression_location: { start: 1, offset: 1 }, stack: { num_stack_frames: 1, top_stack_frame: { method_name: "methodName", line_number: 1, scopes: [{ variables: { "variables": undefined } }, { variables: { "variables": undefined } }] } }, stdout: "stdout" }, { submission_id: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32", line_number: 1, expression_location: { start: 1, offset: 1 }, stack: { num_stack_frames: 1, top_stack_frame: { method_name: "methodName", line_number: 1, scopes: [{ variables: { "variables": undefined } }, { variables: { "variables": undefined } }] } }, stdout: "stdout" }]
    #  )
    def store_traced_workspace(submission_id:, workspace_run_details:, trace_responses:, request_options: nil)
      @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        req.body = {
          **(request_options&.additional_body_parameters || {}),
          workspaceRunDetails: workspace_run_details,
          traceResponses: trace_responses
        }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/admin/store-workspace-trace/submission/#{submission_id}"
      end
    end

    # @param submission_id [String]
    # @param request [Array<Hash>] Request of type Array<SeedTraceClient::Submission::TraceResponseV2>, as a Hash
    #   * :submission_id (String)
    #   * :line_number (Integer)
    #   * :file (Hash)
    #     * :filename (String)
    #     * :directory (String)
    #   * :return_value (Hash)
    #   * :expression_location (Hash)
    #     * :start (Integer)
    #     * :offset (Integer)
    #   * :stack (Hash)
    #     * :num_stack_frames (Integer)
    #     * :top_stack_frame (Hash)
    #       * :method_name (String)
    #       * :line_number (Integer)
    #       * :scopes (Array<SeedTraceClient::Submission::Scope>)
    #   * :stdout (String)
    # @param request_options [SeedTraceClient::RequestOptions]
    # @return [Void]
    # @example
    #  trace = SeedTraceClient::Client.new(
    #    base_url: "https://api.example.com",
    #    environment: SeedTraceClient::Environment::PROD,
    #    token: "YOUR_AUTH_TOKEN"
    #  )
    #  trace.admin.store_traced_workspace_v_2(submission_id: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32", request: [{ submission_id: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32", line_number: 1, file: { filename: "filename", directory: "directory" }, expression_location: { start: 1, offset: 1 }, stack: { num_stack_frames: 1, top_stack_frame: { method_name: "methodName", line_number: 1, scopes: [{ variables: { "variables": undefined } }, { variables: { "variables": undefined } }] } }, stdout: "stdout" }, { submission_id: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32", line_number: 1, file: { filename: "filename", directory: "directory" }, expression_location: { start: 1, offset: 1 }, stack: { num_stack_frames: 1, top_stack_frame: { method_name: "methodName", line_number: 1, scopes: [{ variables: { "variables": undefined } }, { variables: { "variables": undefined } }] } }, stdout: "stdout" }])
    def store_traced_workspace_v_2(submission_id:, request:, request_options: nil)
      @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/admin/store-workspace-trace-v2/submission/#{submission_id}"
      end
    end
  end

  class AsyncAdminClient
    # @return [SeedTraceClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedTraceClient::AsyncRequestClient]
    # @return [SeedTraceClient::AsyncAdminClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param submission_id [String]
    # @param request [SeedTraceClient::Submission::TestSubmissionStatus]
    # @param request_options [SeedTraceClient::RequestOptions]
    # @return [Void]
    # @example
    #  trace = SeedTraceClient::Client.new(
    #    base_url: "https://api.example.com",
    #    environment: SeedTraceClient::Environment::PROD,
    #    token: "YOUR_AUTH_TOKEN"
    #  )
    #  trace.admin.update_test_submission_status(submission_id: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")
    def update_test_submission_status(submission_id:, request:, request_options: nil)
      Async do
        @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/admin/store-test-submission-status/#{submission_id}"
        end
      end
    end

    # @param submission_id [String]
    # @param request [Hash] Request of type SeedTraceClient::Submission::TestSubmissionUpdate, as a Hash
    #   * :update_time (DateTime)
    #   * :update_info (Hash)
    # @param request_options [SeedTraceClient::RequestOptions]
    # @return [Void]
    # @example
    #  trace = SeedTraceClient::Client.new(
    #    base_url: "https://api.example.com",
    #    environment: SeedTraceClient::Environment::PROD,
    #    token: "YOUR_AUTH_TOKEN"
    #  )
    #  trace.admin.send_test_submission_update(submission_id: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32", request: { update_time: DateTime.parse("2024-01-15T09:30:00.000Z") })
    def send_test_submission_update(submission_id:, request:, request_options: nil)
      Async do
        @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/admin/store-test-submission-status-v2/#{submission_id}"
        end
      end
    end

    # @param submission_id [String]
    # @param request [SeedTraceClient::Submission::WorkspaceSubmissionStatus]
    # @param request_options [SeedTraceClient::RequestOptions]
    # @return [Void]
    # @example
    #  trace = SeedTraceClient::Client.new(
    #    base_url: "https://api.example.com",
    #    environment: SeedTraceClient::Environment::PROD,
    #    token: "YOUR_AUTH_TOKEN"
    #  )
    #  trace.admin.update_workspace_submission_status(submission_id: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")
    def update_workspace_submission_status(submission_id:, request:, request_options: nil)
      Async do
        @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/admin/store-workspace-submission-status/#{submission_id}"
        end
      end
    end

    # @param submission_id [String]
    # @param request [Hash] Request of type SeedTraceClient::Submission::WorkspaceSubmissionUpdate, as a Hash
    #   * :update_time (DateTime)
    #   * :update_info (Hash)
    # @param request_options [SeedTraceClient::RequestOptions]
    # @return [Void]
    # @example
    #  trace = SeedTraceClient::Client.new(
    #    base_url: "https://api.example.com",
    #    environment: SeedTraceClient::Environment::PROD,
    #    token: "YOUR_AUTH_TOKEN"
    #  )
    #  trace.admin.send_workspace_submission_update(submission_id: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32", request: { update_time: DateTime.parse("2024-01-15T09:30:00.000Z") })
    def send_workspace_submission_update(submission_id:, request:, request_options: nil)
      Async do
        @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/admin/store-workspace-submission-status-v2/#{submission_id}"
        end
      end
    end

    # @param submission_id [String]
    # @param test_case_id [String]
    # @param result [Hash] Request of type SeedTraceClient::Submission::TestCaseResultWithStdout, as a Hash
    #   * :result (Hash)
    #     * :expected_result (Hash)
    #     * :actual_result (Hash)
    #     * :passed (Boolean)
    #   * :stdout (String)
    # @param trace_responses [Array<Hash>] Request of type Array<SeedTraceClient::Submission::TraceResponse>, as a Hash
    #   * :submission_id (String)
    #   * :line_number (Integer)
    #   * :return_value (Hash)
    #   * :expression_location (Hash)
    #     * :start (Integer)
    #     * :offset (Integer)
    #   * :stack (Hash)
    #     * :num_stack_frames (Integer)
    #     * :top_stack_frame (Hash)
    #       * :method_name (String)
    #       * :line_number (Integer)
    #       * :scopes (Array<SeedTraceClient::Submission::Scope>)
    #   * :stdout (String)
    # @param request_options [SeedTraceClient::RequestOptions]
    # @return [Void]
    # @example
    #  trace = SeedTraceClient::Client.new(
    #    base_url: "https://api.example.com",
    #    environment: SeedTraceClient::Environment::PROD,
    #    token: "YOUR_AUTH_TOKEN"
    #  )
    #  trace.admin.store_traced_test_case(
    #    submission_id: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    #    test_case_id: "testCaseId",
    #    result: { result: { passed: true }, stdout: "stdout" },
    #    trace_responses: [{ submission_id: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32", line_number: 1, expression_location: { start: 1, offset: 1 }, stack: { num_stack_frames: 1, top_stack_frame: { method_name: "methodName", line_number: 1, scopes: [{ variables: { "variables": undefined } }, { variables: { "variables": undefined } }] } }, stdout: "stdout" }, { submission_id: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32", line_number: 1, expression_location: { start: 1, offset: 1 }, stack: { num_stack_frames: 1, top_stack_frame: { method_name: "methodName", line_number: 1, scopes: [{ variables: { "variables": undefined } }, { variables: { "variables": undefined } }] } }, stdout: "stdout" }]
    #  )
    def store_traced_test_case(submission_id:, test_case_id:, result:, trace_responses:, request_options: nil)
      Async do
        @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          req.body = {
            **(request_options&.additional_body_parameters || {}),
            result: result,
            traceResponses: trace_responses
          }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/admin/store-test-trace/submission/#{submission_id}/testCase/#{test_case_id}"
        end
      end
    end

    # @param submission_id [String]
    # @param test_case_id [String]
    # @param request [Array<Hash>] Request of type Array<SeedTraceClient::Submission::TraceResponseV2>, as a Hash
    #   * :submission_id (String)
    #   * :line_number (Integer)
    #   * :file (Hash)
    #     * :filename (String)
    #     * :directory (String)
    #   * :return_value (Hash)
    #   * :expression_location (Hash)
    #     * :start (Integer)
    #     * :offset (Integer)
    #   * :stack (Hash)
    #     * :num_stack_frames (Integer)
    #     * :top_stack_frame (Hash)
    #       * :method_name (String)
    #       * :line_number (Integer)
    #       * :scopes (Array<SeedTraceClient::Submission::Scope>)
    #   * :stdout (String)
    # @param request_options [SeedTraceClient::RequestOptions]
    # @return [Void]
    # @example
    #  trace = SeedTraceClient::Client.new(
    #    base_url: "https://api.example.com",
    #    environment: SeedTraceClient::Environment::PROD,
    #    token: "YOUR_AUTH_TOKEN"
    #  )
    #  trace.admin.store_traced_test_case_v_2(
    #    submission_id: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    #    test_case_id: "testCaseId",
    #    request: [{ submission_id: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32", line_number: 1, file: { filename: "filename", directory: "directory" }, expression_location: { start: 1, offset: 1 }, stack: { num_stack_frames: 1, top_stack_frame: { method_name: "methodName", line_number: 1, scopes: [{ variables: { "variables": undefined } }, { variables: { "variables": undefined } }] } }, stdout: "stdout" }, { submission_id: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32", line_number: 1, file: { filename: "filename", directory: "directory" }, expression_location: { start: 1, offset: 1 }, stack: { num_stack_frames: 1, top_stack_frame: { method_name: "methodName", line_number: 1, scopes: [{ variables: { "variables": undefined } }, { variables: { "variables": undefined } }] } }, stdout: "stdout" }]
    #  )
    def store_traced_test_case_v_2(submission_id:, test_case_id:, request:, request_options: nil)
      Async do
        @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/admin/store-test-trace-v2/submission/#{submission_id}/testCase/#{test_case_id}"
        end
      end
    end

    # @param submission_id [String]
    # @param workspace_run_details [Hash] Request of type SeedTraceClient::Submission::WorkspaceRunDetails, as a Hash
    #   * :exception_v_2 (Hash)
    #   * :exception (Hash)
    #     * :exception_type (String)
    #     * :exception_message (String)
    #     * :exception_stacktrace (String)
    #   * :stdout (String)
    # @param trace_responses [Array<Hash>] Request of type Array<SeedTraceClient::Submission::TraceResponse>, as a Hash
    #   * :submission_id (String)
    #   * :line_number (Integer)
    #   * :return_value (Hash)
    #   * :expression_location (Hash)
    #     * :start (Integer)
    #     * :offset (Integer)
    #   * :stack (Hash)
    #     * :num_stack_frames (Integer)
    #     * :top_stack_frame (Hash)
    #       * :method_name (String)
    #       * :line_number (Integer)
    #       * :scopes (Array<SeedTraceClient::Submission::Scope>)
    #   * :stdout (String)
    # @param request_options [SeedTraceClient::RequestOptions]
    # @return [Void]
    # @example
    #  trace = SeedTraceClient::Client.new(
    #    base_url: "https://api.example.com",
    #    environment: SeedTraceClient::Environment::PROD,
    #    token: "YOUR_AUTH_TOKEN"
    #  )
    #  trace.admin.store_traced_workspace(
    #    submission_id: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    #    workspace_run_details: { exception: { exception_type: "exceptionType", exception_message: "exceptionMessage", exception_stacktrace: "exceptionStacktrace" }, stdout: "stdout" },
    #    trace_responses: [{ submission_id: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32", line_number: 1, expression_location: { start: 1, offset: 1 }, stack: { num_stack_frames: 1, top_stack_frame: { method_name: "methodName", line_number: 1, scopes: [{ variables: { "variables": undefined } }, { variables: { "variables": undefined } }] } }, stdout: "stdout" }, { submission_id: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32", line_number: 1, expression_location: { start: 1, offset: 1 }, stack: { num_stack_frames: 1, top_stack_frame: { method_name: "methodName", line_number: 1, scopes: [{ variables: { "variables": undefined } }, { variables: { "variables": undefined } }] } }, stdout: "stdout" }]
    #  )
    def store_traced_workspace(submission_id:, workspace_run_details:, trace_responses:, request_options: nil)
      Async do
        @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          req.body = {
            **(request_options&.additional_body_parameters || {}),
            workspaceRunDetails: workspace_run_details,
            traceResponses: trace_responses
          }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/admin/store-workspace-trace/submission/#{submission_id}"
        end
      end
    end

    # @param submission_id [String]
    # @param request [Array<Hash>] Request of type Array<SeedTraceClient::Submission::TraceResponseV2>, as a Hash
    #   * :submission_id (String)
    #   * :line_number (Integer)
    #   * :file (Hash)
    #     * :filename (String)
    #     * :directory (String)
    #   * :return_value (Hash)
    #   * :expression_location (Hash)
    #     * :start (Integer)
    #     * :offset (Integer)
    #   * :stack (Hash)
    #     * :num_stack_frames (Integer)
    #     * :top_stack_frame (Hash)
    #       * :method_name (String)
    #       * :line_number (Integer)
    #       * :scopes (Array<SeedTraceClient::Submission::Scope>)
    #   * :stdout (String)
    # @param request_options [SeedTraceClient::RequestOptions]
    # @return [Void]
    # @example
    #  trace = SeedTraceClient::Client.new(
    #    base_url: "https://api.example.com",
    #    environment: SeedTraceClient::Environment::PROD,
    #    token: "YOUR_AUTH_TOKEN"
    #  )
    #  trace.admin.store_traced_workspace_v_2(submission_id: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32", request: [{ submission_id: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32", line_number: 1, file: { filename: "filename", directory: "directory" }, expression_location: { start: 1, offset: 1 }, stack: { num_stack_frames: 1, top_stack_frame: { method_name: "methodName", line_number: 1, scopes: [{ variables: { "variables": undefined } }, { variables: { "variables": undefined } }] } }, stdout: "stdout" }, { submission_id: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32", line_number: 1, file: { filename: "filename", directory: "directory" }, expression_location: { start: 1, offset: 1 }, stack: { num_stack_frames: 1, top_stack_frame: { method_name: "methodName", line_number: 1, scopes: [{ variables: { "variables": undefined } }, { variables: { "variables": undefined } }] } }, stdout: "stdout" }])
    def store_traced_workspace_v_2(submission_id:, request:, request_options: nil)
      Async do
        @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/admin/store-workspace-trace-v2/submission/#{submission_id}"
        end
      end
    end
  end
end
