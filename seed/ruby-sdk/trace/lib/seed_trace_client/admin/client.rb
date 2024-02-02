# frozen_string_literal: true

require_relative "../submission/types/submission_id"
require_relative "../submission/types/test_case_result_with_stdout"
require_relative "../submission/types/test_submission_status"
require_relative "../submission/types/test_submission_update"
require_relative "../submission/types/trace_response"
require_relative "../submission/types/trace_response_v_2"
require_relative "../submission/types/workspace_run_details"
require_relative "../submission/types/workspace_submission_status"
require_relative "../submission/types/workspace_submission_update"
require_relative "../v_2/problem/types/test_case_id"
require "async"

module SeedTraceClient
  module Admin
    class AdminClient
      attr_reader :request_client

      # @param request_client [RequestClient]
      # @return [AdminClient]
      def initialize(request_client:)
        # @type [RequestClient]
        @request_client = request_client
      end

      # @param submission_id [Submission::SUBMISSION_ID]
      # @param request [Hash] Request of type Submission::TestSubmissionStatus, as a Hash
      # @param request_options [RequestOptions]
      # @return [Void]
      def update_test_submission_status(submission_id:, request:, request_options: nil)
        @request_client.conn.post("/admin/store-test-submission-status/#{submission_id}") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
          req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
          req.headers["X-Random-Header"] = @request_client.x_random_header if @request_client.x_random_header.nil?
          req.headers = { **req.headers, **request_options&.additional_headers }.compact
          req.body = { **request, **request_options&.additional_body_parameters }.compact
        end
      end

      # @param submission_id [Submission::SUBMISSION_ID]
      # @param request [Hash] Request of type Submission::TestSubmissionUpdate, as a Hash
      #   * :update_time (DateTime)
      #   * :update_info (Hash)
      # @param request_options [RequestOptions]
      # @return [Void]
      def send_test_submission_update(submission_id:, request:, request_options: nil)
        @request_client.conn.post("/admin/store-test-submission-status-v2/#{submission_id}") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
          req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
          req.headers["X-Random-Header"] = @request_client.x_random_header if @request_client.x_random_header.nil?
          req.headers = { **req.headers, **request_options&.additional_headers }.compact
          req.body = { **request, **request_options&.additional_body_parameters }.compact
        end
      end

      # @param submission_id [Submission::SUBMISSION_ID]
      # @param request [Hash] Request of type Submission::WorkspaceSubmissionStatus, as a Hash
      # @param request_options [RequestOptions]
      # @return [Void]
      def update_workspace_submission_status(submission_id:, request:, request_options: nil)
        @request_client.conn.post("/admin/store-workspace-submission-status/#{submission_id}") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
          req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
          req.headers["X-Random-Header"] = @request_client.x_random_header if @request_client.x_random_header.nil?
          req.headers = { **req.headers, **request_options&.additional_headers }.compact
          req.body = { **request, **request_options&.additional_body_parameters }.compact
        end
      end

      # @param submission_id [Submission::SUBMISSION_ID]
      # @param request [Hash] Request of type Submission::WorkspaceSubmissionUpdate, as a Hash
      #   * :update_time (DateTime)
      #   * :update_info (Hash)
      # @param request_options [RequestOptions]
      # @return [Void]
      def send_workspace_submission_update(submission_id:, request:, request_options: nil)
        @request_client.conn.post("/admin/store-workspace-submission-status-v2/#{submission_id}") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
          req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
          req.headers["X-Random-Header"] = @request_client.x_random_header if @request_client.x_random_header.nil?
          req.headers = { **req.headers, **request_options&.additional_headers }.compact
          req.body = { **request, **request_options&.additional_body_parameters }.compact
        end
      end

      # @param submission_id [Submission::SUBMISSION_ID]
      # @param test_case_id [String]
      # @param result [Hash] Request of type Submission::TestCaseResultWithStdout, as a Hash
      #   * :result (Hash)
      #     * :expected_result (Hash)
      #     * :actual_result (Hash)
      #     * :passed (Boolean)
      #   * :stdout (String)
      # @param trace_responses [Array<Submission::TraceResponse>]
      # @param request_options [RequestOptions]
      # @return [Void]
      def store_traced_test_case(submission_id:, test_case_id:, result:, trace_responses:, request_options: nil)
        @request_client.conn.post("/admin/store-test-trace/submission/#{submission_id}/testCase/#{test_case_id}") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
          req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
          req.headers["X-Random-Header"] = @request_client.x_random_header if @request_client.x_random_header.nil?
          req.headers = { **req.headers, **request_options&.additional_headers }.compact
          req.body = {
            **request_options&.additional_body_parameters,
            result: result,
            traceResponses: trace_responses
          }.compact
        end
      end

      # @param submission_id [Submission::SUBMISSION_ID]
      # @param test_case_id [V2::Problem::TEST_CASE_ID]
      # @param request [Array<Submission::TraceResponseV2>]
      # @param request_options [RequestOptions]
      # @return [Void]
      def store_traced_test_case_v_2(submission_id:, test_case_id:, request:, request_options: nil)
        @request_client.conn.post("/admin/store-test-trace-v2/submission/#{submission_id}/testCase/#{test_case_id}") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
          req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
          req.headers["X-Random-Header"] = @request_client.x_random_header if @request_client.x_random_header.nil?
          req.headers = { **req.headers, **request_options&.additional_headers }.compact
          req.body = { **request, **request_options&.additional_body_parameters }.compact
        end
      end

      # @param submission_id [Submission::SUBMISSION_ID]
      # @param workspace_run_details [Hash] Request of type Submission::WorkspaceRunDetails, as a Hash
      #   * :exception_v_2 (Hash)
      #   * :exception (Hash)
      #     * :exception_type (String)
      #     * :exception_message (String)
      #     * :exception_stacktrace (String)
      #   * :stdout (String)
      # @param trace_responses [Array<Submission::TraceResponse>]
      # @param request_options [RequestOptions]
      # @return [Void]
      def store_traced_workspace(submission_id:, workspace_run_details:, trace_responses:, request_options: nil)
        @request_client.conn.post("/admin/store-workspace-trace/submission/#{submission_id}") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
          req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
          req.headers["X-Random-Header"] = @request_client.x_random_header if @request_client.x_random_header.nil?
          req.headers = { **req.headers, **request_options&.additional_headers }.compact
          req.body = {
            **request_options&.additional_body_parameters,
            workspaceRunDetails: workspace_run_details,
            traceResponses: trace_responses
          }.compact
        end
      end

      # @param submission_id [Submission::SUBMISSION_ID]
      # @param request [Array<Submission::TraceResponseV2>]
      # @param request_options [RequestOptions]
      # @return [Void]
      def store_traced_workspace_v_2(submission_id:, request:, request_options: nil)
        @request_client.conn.post("/admin/store-workspace-trace-v2/submission/#{submission_id}") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
          req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
          req.headers["X-Random-Header"] = @request_client.x_random_header if @request_client.x_random_header.nil?
          req.headers = { **req.headers, **request_options&.additional_headers }.compact
          req.body = { **request, **request_options&.additional_body_parameters }.compact
        end
      end
    end

    class AsyncAdminClient
      attr_reader :request_client

      # @param request_client [AsyncRequestClient]
      # @return [AsyncAdminClient]
      def initialize(request_client:)
        # @type [AsyncRequestClient]
        @request_client = request_client
      end

      # @param submission_id [Submission::SUBMISSION_ID]
      # @param request [Hash] Request of type Submission::TestSubmissionStatus, as a Hash
      # @param request_options [RequestOptions]
      # @return [Void]
      def update_test_submission_status(submission_id:, request:, request_options: nil)
        Async.call do
          @request_client.conn.post("/admin/store-test-submission-status/#{submission_id}") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
            req.headers["X-Random-Header"] = @request_client.x_random_header if @request_client.x_random_header.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
            req.body = { **request, **request_options&.additional_body_parameters }.compact
          end
        end
      end

      # @param submission_id [Submission::SUBMISSION_ID]
      # @param request [Hash] Request of type Submission::TestSubmissionUpdate, as a Hash
      #   * :update_time (DateTime)
      #   * :update_info (Hash)
      # @param request_options [RequestOptions]
      # @return [Void]
      def send_test_submission_update(submission_id:, request:, request_options: nil)
        Async.call do
          @request_client.conn.post("/admin/store-test-submission-status-v2/#{submission_id}") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
            req.headers["X-Random-Header"] = @request_client.x_random_header if @request_client.x_random_header.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
            req.body = { **request, **request_options&.additional_body_parameters }.compact
          end
        end
      end

      # @param submission_id [Submission::SUBMISSION_ID]
      # @param request [Hash] Request of type Submission::WorkspaceSubmissionStatus, as a Hash
      # @param request_options [RequestOptions]
      # @return [Void]
      def update_workspace_submission_status(submission_id:, request:, request_options: nil)
        Async.call do
          @request_client.conn.post("/admin/store-workspace-submission-status/#{submission_id}") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
            req.headers["X-Random-Header"] = @request_client.x_random_header if @request_client.x_random_header.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
            req.body = { **request, **request_options&.additional_body_parameters }.compact
          end
        end
      end

      # @param submission_id [Submission::SUBMISSION_ID]
      # @param request [Hash] Request of type Submission::WorkspaceSubmissionUpdate, as a Hash
      #   * :update_time (DateTime)
      #   * :update_info (Hash)
      # @param request_options [RequestOptions]
      # @return [Void]
      def send_workspace_submission_update(submission_id:, request:, request_options: nil)
        Async.call do
          @request_client.conn.post("/admin/store-workspace-submission-status-v2/#{submission_id}") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
            req.headers["X-Random-Header"] = @request_client.x_random_header if @request_client.x_random_header.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
            req.body = { **request, **request_options&.additional_body_parameters }.compact
          end
        end
      end

      # @param submission_id [Submission::SUBMISSION_ID]
      # @param test_case_id [String]
      # @param result [Hash] Request of type Submission::TestCaseResultWithStdout, as a Hash
      #   * :result (Hash)
      #     * :expected_result (Hash)
      #     * :actual_result (Hash)
      #     * :passed (Boolean)
      #   * :stdout (String)
      # @param trace_responses [Array<Submission::TraceResponse>]
      # @param request_options [RequestOptions]
      # @return [Void]
      def store_traced_test_case(submission_id:, test_case_id:, result:, trace_responses:, request_options: nil)
        Async.call do
          @request_client.conn.post("/admin/store-test-trace/submission/#{submission_id}/testCase/#{test_case_id}") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
            req.headers["X-Random-Header"] = @request_client.x_random_header if @request_client.x_random_header.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
            req.body = {
              **request_options&.additional_body_parameters,
              result: result,
              traceResponses: trace_responses
            }.compact
          end
        end
      end

      # @param submission_id [Submission::SUBMISSION_ID]
      # @param test_case_id [V2::Problem::TEST_CASE_ID]
      # @param request [Array<Submission::TraceResponseV2>]
      # @param request_options [RequestOptions]
      # @return [Void]
      def store_traced_test_case_v_2(submission_id:, test_case_id:, request:, request_options: nil)
        Async.call do
          @request_client.conn.post("/admin/store-test-trace-v2/submission/#{submission_id}/testCase/#{test_case_id}") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
            req.headers["X-Random-Header"] = @request_client.x_random_header if @request_client.x_random_header.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
            req.body = { **request, **request_options&.additional_body_parameters }.compact
          end
        end
      end

      # @param submission_id [Submission::SUBMISSION_ID]
      # @param workspace_run_details [Hash] Request of type Submission::WorkspaceRunDetails, as a Hash
      #   * :exception_v_2 (Hash)
      #   * :exception (Hash)
      #     * :exception_type (String)
      #     * :exception_message (String)
      #     * :exception_stacktrace (String)
      #   * :stdout (String)
      # @param trace_responses [Array<Submission::TraceResponse>]
      # @param request_options [RequestOptions]
      # @return [Void]
      def store_traced_workspace(submission_id:, workspace_run_details:, trace_responses:, request_options: nil)
        Async.call do
          @request_client.conn.post("/admin/store-workspace-trace/submission/#{submission_id}") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
            req.headers["X-Random-Header"] = @request_client.x_random_header if @request_client.x_random_header.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
            req.body = {
              **request_options&.additional_body_parameters,
              workspaceRunDetails: workspace_run_details,
              traceResponses: trace_responses
            }.compact
          end
        end
      end

      # @param submission_id [Submission::SUBMISSION_ID]
      # @param request [Array<Submission::TraceResponseV2>]
      # @param request_options [RequestOptions]
      # @return [Void]
      def store_traced_workspace_v_2(submission_id:, request:, request_options: nil)
        Async.call do
          @request_client.conn.post("/admin/store-workspace-trace-v2/submission/#{submission_id}") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
            req.headers["X-Random-Header"] = @request_client.x_random_header if @request_client.x_random_header.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
            req.body = { **request, **request_options&.additional_body_parameters }.compact
          end
        end
      end
    end
  end
end
