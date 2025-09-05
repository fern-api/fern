
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
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "/sessions/create-session/#{"
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::Submission::Types::ExecutionSessionResponse.load(_response.body)
        else
          raise _response.body
        end
      end

      # Returns execution server URL for session. Returns empty if session isn't registered.
      #
      # @return [Seed::Submission::Types::ExecutionSessionResponse | nil]
      def get_execution_session(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "GET",
          path: "/sessions/#{"
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return 
        else
          raise _response.body
        end
      end

      # Stops execution session.
      #
      # @return [untyped]
      def stop_execution_session(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "DELETE",
          path: "/sessions/stop/#{"
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return
        else
          raise _response.body
        end
      end

      # @return [Seed::Submission::Types::GetExecutionSessionStateResponse]
      def get_execution_sessions_state(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "GET",
          path: "/sessions/execution-sessions-state"
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::Submission::Types::GetExecutionSessionStateResponse.load(_response.body)
        else
          raise _response.body
        end
      end

    end
  end
end
