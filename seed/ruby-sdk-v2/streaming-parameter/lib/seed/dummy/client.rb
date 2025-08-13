
module Seed
    module Dummy
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Dummy::Client]
            def initialize(client)
                @client = client
            end

            # @return [untyped]
            def generate(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "generate"
                )
            end

    end
end
