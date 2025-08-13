
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
            def get_token_with_client_credentials(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/token"
                )
            end

            # @return [Seed::auth::TokenResponse]
            def refresh_token(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/token/refresh"
                )
            end

    end
end
