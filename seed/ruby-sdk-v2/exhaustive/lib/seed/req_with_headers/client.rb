
module Seed
    module ReqWithHeaders
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::ReqWithHeaders::Client]
            def initialize(client)
                @client = client
            end

            # @return [untyped]
            def get_with_custom_header(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/test-headers/custom-header"
                )
            end

    end
end
