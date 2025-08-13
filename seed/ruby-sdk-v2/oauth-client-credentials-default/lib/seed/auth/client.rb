
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
            def get_token(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/token"
                )
            end

    end
end
