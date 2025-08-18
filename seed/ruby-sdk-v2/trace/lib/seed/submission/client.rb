
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
            # @return [Seed::Submission::ExecutionSessionResponse]
            def create_execution_session(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return Seed::Submission::Types::ExecutionSessionResponse.load(_response.body)

                else
                    raise _response.body
            end

            # Returns execution server URL for session. Returns empty if session isn't registered.
            #
            # @return [Seed::Submission::ExecutionSessionResponse | nil]
            def get_execution_session(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return 
                else
                    raise _response.body
            end

            # Stops execution session.
            #
            # @return [untyped]
            def stop_execution_session(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return

                else
                    raise _response.body
            end

            # @return [Seed::Submission::GetExecutionSessionStateResponse]
            def get_execution_sessions_state(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return Seed::Submission::Types::GetExecutionSessionStateResponse.load(_response.body)

                else
                    raise _response.body
            end

    end
end
