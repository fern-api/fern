
module Seed
    module Query
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Query::Client]
            def initialize(client)
                @client = client
            end

            # @return [Seed::SendResponse]
            def send(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "query"
                )
            end

    end
end
