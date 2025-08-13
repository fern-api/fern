
module Seed
    module Optional
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Optional::Client]
            def initialize(client)
                @client = client
            end

            # @return [String]
            def send_optional_body(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "send-optional-body"
                )
            end

    end
end
