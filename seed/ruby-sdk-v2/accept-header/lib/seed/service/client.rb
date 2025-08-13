
module Seed
    module Service
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Service::Client]
            def initialize(client)
                @client = client
            end

            # @return [untyped]
            def endpoint(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: DELETE,
                    path: "/container/"
                )
            end

    end
end
