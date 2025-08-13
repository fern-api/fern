
module Seed
    module Health
        module Service
            class Client
                # @option client [Seed::Internal::Http::RawClient]
                #
                # @return [Seed::Health::Service::Client]
                def initialize(client)
                    @client = client
                end

                # This endpoint checks the health of a resource.
                #
                # @return [untyped]
                def check(request_options: {}, **params)
                    _request = params

                    _response = @client.send(_request)
                    if _response.code >= "200" && _response.code < "300"
                        return

                    else
                        raise _response.body
                end

                # This endpoint checks the health of the service.
                #
                # @return [bool]
                def ping(request_options: {}, **params)
                    _request = params

                    _response = @client.send(_request)
                    if _response.code >= "200" && _response.code < "300"
                        return 
                    else
                        raise _response.body
                end

        end
    end
end
