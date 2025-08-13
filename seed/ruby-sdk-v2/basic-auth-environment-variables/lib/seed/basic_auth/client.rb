
module Seed
    module BasicAuth
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::BasicAuth::Client]
            def initialize(client)
                @client = client
            end

            # GET request with basic auth scheme
            #
            # @return [bool]
            def get_with_basic_auth(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # POST request with basic auth scheme
            #
            # @return [bool]
            def post_with_basic_auth(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "basic-auth"
                )
            end

    end
end
