
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
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Array[Seed::Service::Resource]]
            def list_resources(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

    end
end
