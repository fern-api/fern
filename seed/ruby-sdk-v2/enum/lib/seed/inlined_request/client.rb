
module Seed
    module InlinedRequest
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::InlinedRequest::Client]
            def initialize(client)
                @client = client
            end

            # @return [untyped]
            def send(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "inlined"
                )
            end

    end
end
