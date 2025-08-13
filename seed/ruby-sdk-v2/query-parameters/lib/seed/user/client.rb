
module Seed
    module User
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::User::Client]
            def initialize(client)
                @client = client
            end

            # @return [Seed::user::User]
            def get_username
                raise NotImplementedError, 'This method is not yet implemented.'
            end

    end
end
