# frozen_string_literal: true

module FernTrace
  module Submission
    class Client
      # @param client [FernTrace::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # Returns sessionId and execution server URL for session. Spins up server.
      #
      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [FernTrace::Commons::Types::Language] :language
      #
      # @return [FernTrace::Submission::Types::ExecutionSessionResponse]
      def create_execution_session(request_options: {}, **params)
        params = FernTrace::Internal::Types::Utils.normalize_keys(params)
        request = FernTrace::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/sessions/create-session/#{params[:language]}",
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernTrace::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          FernTrace::Submission::Types::ExecutionSessionResponse.load(response.body)
        else
          error_class = FernTrace::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end

      # Returns execution server URL for session. Returns empty if session isn't registered.
      #
      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [String] :session_id
      #
      # @return [FernTrace::Submission::Types::ExecutionSessionResponse, nil]
      def get_execution_session(request_options: {}, **params)
        params = FernTrace::Internal::Types::Utils.normalize_keys(params)
        request = FernTrace::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/sessions/#{params[:session_id]}",
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

      # Stops execution session.
      #
      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [String] :session_id
      #
      # @return [untyped]
      def stop_execution_session(request_options: {}, **params)
        params = FernTrace::Internal::Types::Utils.normalize_keys(params)
        request = FernTrace::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "DELETE",
          path: "/sessions/stop/#{params[:session_id]}",
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
      #
      # @return [FernTrace::Submission::Types::GetExecutionSessionStateResponse]
      def get_execution_sessions_state(request_options: {}, **params)
        FernTrace::Internal::Types::Utils.normalize_keys(params)
        request = FernTrace::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/sessions/execution-sessions-state",
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernTrace::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          FernTrace::Submission::Types::GetExecutionSessionStateResponse.load(response.body)
        else
          error_class = FernTrace::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end
    end
  end
end
