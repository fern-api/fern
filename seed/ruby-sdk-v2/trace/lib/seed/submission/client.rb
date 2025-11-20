# frozen_string_literal: true

module Seed
  module Submission
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [Seed::Submission::Client]
      def initialize(client:)
        @client = client
      end

      # Returns sessionId and execution server URL for session. Spins up server.
      #
      # @param request_options [Seed::RequestOptions]
      # @param params [Hash[untyped, untyped]]
      # @option params [Seed::Commons::Types::Language] :language
      #
      # @return [Seed::Submission::Types::ExecutionSessionResponse]
      def create_execution_session(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::PROD,
          method: "POST",
          path: "/sessions/create-session/#{params[:language]}"
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        if code.between?(200, 299)
          Seed::Submission::Types::ExecutionSessionResponse.load(_response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end
      end

      # Returns execution server URL for session. Returns empty if session isn't registered.
      #
      # @param request_options [Seed::RequestOptions]
      # @param params [Hash[untyped, untyped]]
      # @option params [String] :session_id
      #
      # @return [Seed::Submission::Types::ExecutionSessionResponse | nil]
      def get_execution_session(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::PROD,
          method: "GET",
          path: "/sessions/#{params[:session_id]}"
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        return if code.between?(200, 299)

        error_class = Seed::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(_response.body, code: code)
      end

      # Stops execution session.
      #
      # @param request_options [Seed::RequestOptions]
      # @param params [Hash[untyped, untyped]]
      # @option params [String] :session_id
      #
      # @return [untyped]
      def stop_execution_session(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::PROD,
          method: "DELETE",
          path: "/sessions/stop/#{params[:session_id]}"
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        return if code.between?(200, 299)

        error_class = Seed::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(_response.body, code: code)
      end

      # @param request_options [Seed::RequestOptions]
      # @param params [Hash[untyped, untyped]]
      #
      # @return [Seed::Submission::Types::GetExecutionSessionStateResponse]
      def get_execution_sessions_state(request_options: {}, **_params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::PROD,
          method: "GET",
          path: "/sessions/execution-sessions-state"
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        if code.between?(200, 299)
          Seed::Submission::Types::GetExecutionSessionStateResponse.load(_response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end
      end
    end
  end
end
