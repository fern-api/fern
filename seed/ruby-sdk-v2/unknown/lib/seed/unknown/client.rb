
module Seed
    module Unknown
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Unknown::Client]
            def initialize(client)
                @client = client
            end

            # @return [Array[Hash[String, untyped]]]
            def post(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: ""
                )
            end

            # @return [Array[Hash[String, untyped]]]
            def post_object(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/with-object"
                )
            end

    end
end
