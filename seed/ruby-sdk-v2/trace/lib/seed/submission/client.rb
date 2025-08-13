
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
<<<<<<< HEAD
            # @return [Seed::Submission::ExecutionSessionResponse]
            def create_execution_session(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
=======
            # @return [Seed::submission::ExecutionSessionResponse]
            def create_execution_session(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/sessions/create-session/#{params[:language]}"
                )
>>>>>>> ca21b06d09 (fix)
            end

            # Returns execution server URL for session. Returns empty if session isn't registered.
            #
<<<<<<< HEAD
            # @return [Seed::Submission::ExecutionSessionResponse | nil]
            def get_execution_session(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
=======
            # @return [Seed::submission::ExecutionSessionResponse | nil]
            def get_execution_session(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "/sessions/#{params[:sessionId]}"
                )
>>>>>>> ca21b06d09 (fix)
            end

            # Stops execution session.
            #
            # @return [untyped]
            def stop_execution_session(request_options: {}, **params)
<<<<<<< HEAD
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::Submission::GetExecutionSessionStateResponse]
            def get_execution_sessions_state(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
=======
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
>>>>>>> ca21b06d09 (fix)
            end

    end
end
