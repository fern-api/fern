
module Seed
    module Service
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Service::Client]
            def initialize(client)
                @client = client
            end

            # List resources with pagination
            #
            # @return [Array[Seed::Types::Resource]]
            def list_resources(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return 
                else
                    raise _response.body
            end

            # Get a single resource
            #
            # @return [Seed::Types::Resource]
            def get_resource(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return Seed::Types::Types::Resource.load(_response.body)

                else
                    raise _response.body
            end

            # Search resources with complex parameters
            #
            # @return [Seed::Types::SearchResponse]
            def search_resources(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return Seed::Types::Types::SearchResponse.load(_response.body)

                else
                    raise _response.body
            end

    end
end
