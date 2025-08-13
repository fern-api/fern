
module Seed
    module Auth
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Auth::Client]
            def initialize(client)
                @client = client
            end

            # @return [Seed::Auth::TokenResponse]
            def get_token_with_client_credentials(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::Auth::TokenResponse]
            def refresh_token(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

    end
end
