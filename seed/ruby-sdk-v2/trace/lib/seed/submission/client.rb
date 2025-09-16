# frozen_string_literal: true

module Seed
  module Submission
    class Client
      # @return [Seed::Submission::Client]
      def initialize(client:)
        @client = client
      end

      # Returns sessionId and execution server URL for session. Spins up server.
      #
      # @return [Seed::Submission::Types::ExecutionSessionResponse]
      def create_execution_session(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::Prod,
          method: "POST",
          path: "/sessions/create-session/#{params[:language]}"
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::Submission::Types::ExecutionSessionResponse.load(_response.body)
        end

        raise _response.body
      end

      # Returns execution server URL for session. Returns empty if session isn't registered.
      #
      # @return [Seed::Submission::Types::ExecutionSessionResponse | nil]
      def get_execution_session(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::Prod,
          method: "GET",
          path: "/sessions/#{params[:sessionId]}"
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # Stops execution session.
      #
      # @return [untyped]
      def stop_execution_session(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::Prod,
          method: "DELETE",
          path: "/sessions/stop/#{params[:sessionId]}"
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # @return [Seed::Submission::Types::GetExecutionSessionStateResponse]
      def get_execution_sessions_state(request_options: {}, **_params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::Prod,
          method: "GET",
          path: "/sessions/execution-sessions-state"
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::Submission::Types::GetExecutionSessionStateResponse.load(_response.body)
        end

        raise _response.body
      end
    end
  end
end
