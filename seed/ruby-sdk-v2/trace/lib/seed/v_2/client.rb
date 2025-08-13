
module Seed
    module V2
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::V2::Client]
            def initialize(client)
                @client = client
            end

            # @return [untyped]
            def test(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: ""
                )
            end

    end
end
