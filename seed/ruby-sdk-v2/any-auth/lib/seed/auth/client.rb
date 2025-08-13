
module Seed
    module Auth
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Auth::Client]
            def initialize(client)
                @client = client
            end

<<<<<<< HEAD
            # @return [Seed::Auth::TokenResponse]
            def get_token(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
=======
            # @return [Seed::auth::TokenResponse]
            def get_token(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/token"
                )
>>>>>>> ca21b06d09 (fix)
            end

    end
end
