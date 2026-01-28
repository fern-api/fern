# frozen_string_literal: true

module FernTrace
  module Admin
    class Client
      # @param client [FernTrace::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @param request_options [Hash]
      # @param params [FernTrace::Submission::Types::TestSubmissionStatus]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [FernTrace::Submission::Types::SubmissionId] :submission_id
      #
      # @return [untyped]
      def update_test_submission_status(request_options: {}, **params)
        params = FernTrace::Internal::Types::Utils.normalize_keys(params)
        request = FernTrace::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/admin/store-test-submission-status/#{params[:submission_id]}",
          body: FernTrace::Submission::Types::TestSubmissionStatus.new(params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernTrace::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernTrace::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end

      # @param request_options [Hash]
      # @param params [FernTrace::Submission::Types::TestSubmissionUpdate]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [FernTrace::Submission::Types::SubmissionId] :submission_id
      #
      # @return [untyped]
      def send_test_submission_update(request_options: {}, **params)
        params = FernTrace::Internal::Types::Utils.normalize_keys(params)
        request = FernTrace::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/admin/store-test-submission-status-v2/#{params[:submission_id]}",
          body: FernTrace::Submission::Types::TestSubmissionUpdate.new(params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernTrace::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernTrace::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end

      # @param request_options [Hash]
      # @param params [FernTrace::Submission::Types::WorkspaceSubmissionStatus]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [FernTrace::Submission::Types::SubmissionId] :submission_id
      #
      # @return [untyped]
      def update_workspace_submission_status(request_options: {}, **params)
        params = FernTrace::Internal::Types::Utils.normalize_keys(params)
        request = FernTrace::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/admin/store-workspace-submission-status/#{params[:submission_id]}",
          body: FernTrace::Submission::Types::WorkspaceSubmissionStatus.new(params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernTrace::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernTrace::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end

      # @param request_options [Hash]
      # @param params [FernTrace::Submission::Types::WorkspaceSubmissionUpdate]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [FernTrace::Submission::Types::SubmissionId] :submission_id
      #
      # @return [untyped]
      def send_workspace_submission_update(request_options: {}, **params)
        params = FernTrace::Internal::Types::Utils.normalize_keys(params)
        request = FernTrace::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/admin/store-workspace-submission-status-v2/#{params[:submission_id]}",
          body: FernTrace::Submission::Types::WorkspaceSubmissionUpdate.new(params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernTrace::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernTrace::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end

      # @param request_options [Hash]
      # @param params [FernTrace::Admin::Types::StoreTracedTestCaseRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [FernTrace::Submission::Types::SubmissionId] :submission_id
      # @option params [String] :test_case_id
      #
      # @return [untyped]
      def store_traced_test_case(request_options: {}, **params)
        params = FernTrace::Internal::Types::Utils.normalize_keys(params)
        request_data = FernTrace::Admin::Types::StoreTracedTestCaseRequest.new(params).to_h
        non_body_param_names = %w[submissionId testCaseId]
        body = request_data.except(*non_body_param_names)

        request = FernTrace::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/admin/store-test-trace/submission/#{params[:submission_id]}/testCase/#{params[:test_case_id]}",
          body: body,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernTrace::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernTrace::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end

      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [FernTrace::Submission::Types::SubmissionId] :submission_id
      # @option params [FernTrace::V2::Problem::Types::TestCaseId] :test_case_id
      #
      # @return [untyped]
      def store_traced_test_case_v_2(request_options: {}, **params)
        params = FernTrace::Internal::Types::Utils.normalize_keys(params)
        request = FernTrace::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/admin/store-test-trace-v2/submission/#{params[:submission_id]}/testCase/#{params[:test_case_id]}",
          body: params,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernTrace::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernTrace::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end

      # @param request_options [Hash]
      # @param params [FernTrace::Admin::Types::StoreTracedWorkspaceRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [FernTrace::Submission::Types::SubmissionId] :submission_id
      #
      # @return [untyped]
      def store_traced_workspace(request_options: {}, **params)
        params = FernTrace::Internal::Types::Utils.normalize_keys(params)
        request_data = FernTrace::Admin::Types::StoreTracedWorkspaceRequest.new(params).to_h
        non_body_param_names = ["submissionId"]
        body = request_data.except(*non_body_param_names)

        request = FernTrace::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/admin/store-workspace-trace/submission/#{params[:submission_id]}",
          body: body,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernTrace::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernTrace::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end

      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [FernTrace::Submission::Types::SubmissionId] :submission_id
      #
      # @return [untyped]
      def store_traced_workspace_v_2(request_options: {}, **params)
        params = FernTrace::Internal::Types::Utils.normalize_keys(params)
        request = FernTrace::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/admin/store-workspace-trace-v2/submission/#{params[:submission_id]}",
          body: params,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernTrace::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernTrace::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end
    end
  end
end
