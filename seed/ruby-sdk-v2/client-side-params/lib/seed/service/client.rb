
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
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # Get a single resource
            #
            # @return [Seed::Types::Resource]
            def get_resource(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # Search resources with complex parameters
            #
            # @return [Seed::Types::SearchResponse]
            def search_resources(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

    end
end
