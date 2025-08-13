
module Seed
    module Submission
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Submission::Client]
            def initialize(client)
                @client = client
            end

            # Returns sessionId and execution server URL for session. Spins up server.
            #
            # @return [Seed::submission::ExecutionSessionResponse]
            def create_execution_session(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/sessions/create-session/#{params[:language]}"
                )
            end

            # Returns execution server URL for session. Returns empty if session isn't registered.
            #
            # @return [Seed::submission::ExecutionSessionResponse | nil]
            def get_execution_session(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "/sessions/#{params[:sessionId]}"
                )
            end

            # Stops execution session.
            #
            # @return [untyped]
            def stop_execution_session(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: DELETE,
                    path: "/sessions/stop/#{params[:sessionId]}"
                )
            end

            # @return [Seed::submission::GetExecutionSessionStateResponse]
            def get_execution_sessions_state(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "/sessions/execution-sessions-state"
                )
            end

    end
end
