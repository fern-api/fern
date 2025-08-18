
module Seed
    module Service
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Service::Client]
            def initialize(client)
                @client = client
            end

            # @return [Seed::Service::Resource]
            def get_resource(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if if _response.code >= "200" && _response.code < "300"
                    return Seed::Service::Types::Resource.load(_response.body)
                    
                else
                    raise _response.body
                end
            end

            # @return [Array[Seed::Service::Resource]]
            def list_resources(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if if _response.code >= "200" && _response.code < "300"
                    return 
                else
                    raise _response.body
                end
            end
        end
    end
end
