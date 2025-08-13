
module Seed
    module Endpoints
        module Put
            class Client
                # @option client [Seed::Internal::Http::RawClient]
                #
                # @return [Seed::Endpoints::Put::Client]
                def initialize(client)
                    @client = client
                end

                # @return [Seed::Endpoints::Put::PutResponse]
                def add(request_options: {}, **params)
                    _request = params

                    _response = @client.send(_request)
                    if _response.code >= "200" && _response.code < "300"
                        return Seed::Endpoints::Put::Types::PutResponse.load(_response.body)

                    else
                        raise _response.body
                end

        end
    end
end
