
module Seed
    module Submission
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Submission::Client]
            def initialize(client)
                @client = client
            end

            # @return [Seed::submission::ExecutionSessionResponse]
            def create_execution_session
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::submission::ExecutionSessionResponse | nil]
            def get_execution_session
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [untyped]
            def stop_execution_session
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::submission::GetExecutionSessionStateResponse]
            def get_execution_sessions_state
                raise NotImplementedError, 'This method is not yet implemented.'
            end

    end
end
