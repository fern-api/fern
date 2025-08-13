
module Seed
    module User
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::User::Client]
            def initialize(client)
                @client = client
            end

            # List all users.
            #
            # @return [Array[Seed::User::User]]
            def list(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

    end
end
