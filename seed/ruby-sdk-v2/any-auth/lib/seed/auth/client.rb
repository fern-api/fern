
module Seed
    module Auth
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Auth::Client]
            def initialize(client)
                @client = client
            end

            # @return [Seed::auth::TokenResponse]
            def get_token
                raise NotImplementedError, 'This method is not yet implemented.'
            end

    end
end
