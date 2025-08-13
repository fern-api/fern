
module Seed
    module Package
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Package::Client]
            def initialize(client)
                @client = client
            end

            # @return [untyped]
            def test(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: ""
                )
            end

    end
end
