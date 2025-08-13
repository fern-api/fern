
module Seed
    module NoAuth
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::NoAuth::Client]
            def initialize(client)
                @client = client
            end

            # POST request with no auth
            #
            # @return [bool]
            def post_with_no_auth(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/no-auth"
                )
            end

    end
end
