
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
                _request = params

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return Seed::Types::SendResponse.load(_response.body)

                else
                    raise _response.body
            end

    end
end
