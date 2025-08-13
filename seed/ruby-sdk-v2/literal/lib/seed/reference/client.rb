
module Seed
    module Reference
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Reference::Client]
            def initialize(client)
                @client = client
            end

            # @return [Seed::SendResponse]
            def send(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "reference"
                )

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return Seed::Types::SendResponse.load(_response.body)

                else
                    raise _response.body
            end

    end
end
