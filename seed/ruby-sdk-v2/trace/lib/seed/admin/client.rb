# frozen_string_literal: true

module Seed
  module Admin
    class Client
      # @return [Seed::Admin::Client]
      def initialize(client:)
        @client = client
      end

      # @return [untyped]
      def update_test_submission_status(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "/admin/store-test-submission-status/#{params[:submissionId]}",
          body: Seed::Submission::Types::TestSubmissionStatus.new(params).to_h
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # @return [untyped]
      def send_test_submission_update(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "/admin/store-test-submission-status-v2/#{params[:submissionId]}",
          body: Seed::Submission::Types::TestSubmissionUpdate.new(params).to_h
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # @return [untyped]
      def update_workspace_submission_status(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "/admin/store-workspace-submission-status/#{params[:submissionId]}",
          body: Seed::Submission::Types::WorkspaceSubmissionStatus.new(params).to_h
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # @return [untyped]
      def send_workspace_submission_update(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "/admin/store-workspace-submission-status-v2/#{params[:submissionId]}",
          body: Seed::Submission::Types::WorkspaceSubmissionUpdate.new(params).to_h
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # @return [untyped]
      def store_traced_test_case(request_options: {}, **params)
        _path_param_names = %w[submissionId testCaseId]

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "/admin/store-test-trace/submission/#{params[:submissionId]}/testCase/#{params[:testCaseId]}",
          body: params.except(*_path_param_names)
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # @return [untyped]
      def store_traced_test_case_v_2(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "/admin/store-test-trace-v2/submission/#{params[:submissionId]}/testCase/#{params[:testCaseId]}",
          body: params
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # @return [untyped]
      def store_traced_workspace(request_options: {}, **params)
        _path_param_names = ["submissionId"]

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "/admin/store-workspace-trace/submission/#{params[:submissionId]}",
          body: params.except(*_path_param_names)
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # @return [untyped]
      def store_traced_workspace_v_2(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "/admin/store-workspace-trace-v2/submission/#{params[:submissionId]}",
          body: params
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end
    end
  end
end
