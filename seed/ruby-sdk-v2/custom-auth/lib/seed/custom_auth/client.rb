
module Seed
    module CustomAuth
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::CustomAuth::Client]
            def initialize(client)
                @client = client
            end

            # GET request with custom auth scheme
            #
            # @return [bool]
            def get_with_custom_auth(request_options: {}, **params)
<<<<<<< HEAD
                raise NotImplementedError, 'This method is not yet implemented.'
=======
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "custom-auth"
                )
>>>>>>> ca21b06d09 (fix)
            end

            # POST request with custom auth scheme
            #
            # @return [bool]
            def post_with_custom_auth(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "custom-auth"
                )
            end

    end
end
