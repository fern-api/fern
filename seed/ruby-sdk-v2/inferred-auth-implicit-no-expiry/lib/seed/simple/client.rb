
module Seed
    module Simple
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Simple::Client]
            def initialize(client)
                @client = client
            end

            # @return [untyped]
            def get_something(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "/get-something"
                )
            end

    end
end
