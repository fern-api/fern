
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
            def get_token_with_client_credentials
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::auth::TokenResponse]
            def refresh_token
                raise NotImplementedError, 'This method is not yet implemented.'
            end
        end
    end
end
