
module Seed
    module QueryParam
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::QueryParam::Client]
            def initialize(client)
                @client = client
            end

            # @return [untyped]
            def send(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "query"
                )
            end

            # @return [untyped]
            def send_list(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "query-list"
                )
            end

    end
end
