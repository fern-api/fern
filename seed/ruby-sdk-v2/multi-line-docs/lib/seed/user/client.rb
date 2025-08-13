
module Seed
    module User
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::User::Client]
            def initialize(client)
                @client = client
            end

            # Retrieve a user.
            # This endpoint is used to retrieve a user.
            #
            # @return [untyped]
            def get_user(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # Create a new user.
            # This endpoint is used to create a new user.
            #
            # @return [Seed::User::User]
            def create_user(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

    end
end
