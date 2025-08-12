
module Seed
    module Service
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Service::Client]
            def initialize(client)
                @client = client
            end

            # @return [Seed::service::Resource]
            def get_resource
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Array[Seed::service::Resource]]
            def list_resources
                raise NotImplementedError, 'This method is not yet implemented.'
            end
        end
    end
end
