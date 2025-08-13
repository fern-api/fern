
module Seed
    module Admin
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Admin::Client]
            def initialize(client)
                @client = client
            end

            # @return [untyped]
            def update_test_submission_status
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [untyped]
            def send_test_submission_update
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [untyped]
            def update_workspace_submission_status
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [untyped]
            def send_workspace_submission_update
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [untyped]
            def store_traced_test_case
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [untyped]
            def store_traced_test_case_v_2
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [untyped]
            def store_traced_workspace
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [untyped]
            def store_traced_workspace_v_2
                raise NotImplementedError, 'This method is not yet implemented.'
            end

    end
end
