# frozen_string_literal: true

require_relative "types/execution_session_response"
require_relative "types/get_execution_session_state_response"
require "async"

module SeedTraceClient
  module Submission
    class SubmissionClient
      attr_reader :request_client

      # @param request_client [RequestClient]
      # @return [SubmissionClient]
      def initialize(request_client:)
        # @type [RequestClient]
        @request_client = request_client
      end

      # @param language [Hash{String => String}]
      # @param request_options [RequestOptions]
      # @return [Submission::ExecutionSessionResponse]
      def create_execution_session(language:, request_options: nil)
        response = @request_client.conn.post("/sessions/create-session/#{language}") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
          req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
          req.headers["X-Random-Header"] = @request_client.x_random_header if @request_client.x_random_header.nil?
          req.headers = { **req.headers, **request_options&.additional_headers }.compact
        end
        Submission::ExecutionSessionResponse.from_json(json_object: response)
      end

      # @param session_id [String]
      # @param request_options [RequestOptions]
      # @return [Submission::ExecutionSessionResponse]
      def get_execution_session(session_id:, request_options: nil)
        response = @request_client.conn.get("/sessions/#{session_id}") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
          req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
          req.headers["X-Random-Header"] = @request_client.x_random_header if @request_client.x_random_header.nil?
          req.headers = { **req.headers, **request_options&.additional_headers }.compact
        end
        Submission::ExecutionSessionResponse.from_json(json_object: response)
      end

      # @param session_id [String]
      # @param request_options [RequestOptions]
      # @return [Void]
      def stop_execution_session(session_id:, request_options: nil)
        @request_client.conn.delete("/sessions/stop/#{session_id}") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
          req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
          req.headers["X-Random-Header"] = @request_client.x_random_header if @request_client.x_random_header.nil?
          req.headers = { **req.headers, **request_options&.additional_headers }.compact
        end
      end

      # @param request_options [RequestOptions]
      # @return [Submission::GetExecutionSessionStateResponse]
      def get_execution_sessions_state(request_options: nil)
        response = @request_client.conn.get("/sessions/execution-sessions-state") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
          req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
          req.headers["X-Random-Header"] = @request_client.x_random_header if @request_client.x_random_header.nil?
          req.headers = { **req.headers, **request_options&.additional_headers }.compact
        end
        Submission::GetExecutionSessionStateResponse.from_json(json_object: response)
      end
    end

    class AsyncSubmissionClient
      attr_reader :request_client

      # @param request_client [AsyncRequestClient]
      # @return [AsyncSubmissionClient]
      def initialize(request_client:)
        # @type [AsyncRequestClient]
        @request_client = request_client
      end

      # @param language [Hash{String => String}]
      # @param request_options [RequestOptions]
      # @return [Submission::ExecutionSessionResponse]
      def create_execution_session(language:, request_options: nil)
        Async.call do
          response = @request_client.conn.post("/sessions/create-session/#{language}") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
            req.headers["X-Random-Header"] = @request_client.x_random_header if @request_client.x_random_header.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
          end
          Submission::ExecutionSessionResponse.from_json(json_object: response)
        end
      end

      # @param session_id [String]
      # @param request_options [RequestOptions]
      # @return [Submission::ExecutionSessionResponse]
      def get_execution_session(session_id:, request_options: nil)
        Async.call do
          response = @request_client.conn.get("/sessions/#{session_id}") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
            req.headers["X-Random-Header"] = @request_client.x_random_header if @request_client.x_random_header.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
          end
          Submission::ExecutionSessionResponse.from_json(json_object: response)
        end
      end

      # @param session_id [String]
      # @param request_options [RequestOptions]
      # @return [Void]
      def stop_execution_session(session_id:, request_options: nil)
        Async.call do
          @request_client.conn.delete("/sessions/stop/#{session_id}") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
            req.headers["X-Random-Header"] = @request_client.x_random_header if @request_client.x_random_header.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
          end
        end
      end

      # @param request_options [RequestOptions]
      # @return [Submission::GetExecutionSessionStateResponse]
      def get_execution_sessions_state(request_options: nil)
        Async.call do
          response = @request_client.conn.get("/sessions/execution-sessions-state") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
            req.headers["X-Random-Header"] = @request_client.x_random_header if @request_client.x_random_header.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
          end
          Submission::GetExecutionSessionStateResponse.from_json(json_object: response)
        end
      end
    end
  end
end
