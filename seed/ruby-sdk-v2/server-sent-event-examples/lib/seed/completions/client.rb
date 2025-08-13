
module Seed
    module Completions
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Completions::Client]
            def initialize(client)
                @client = client
            end

            # @return [untyped]
            def stream(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "stream"
                )
            end

    end
end
