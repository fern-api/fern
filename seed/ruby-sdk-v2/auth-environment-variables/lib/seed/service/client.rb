
module Seed
    module Service
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Service::Client]
            def initialize(client)
                @client = client
            end

            # @return [String]
            def get_with_api_key
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [String]
            def get_with_header
                raise NotImplementedError, 'This method is not yet implemented.'
            end
        end
    end
end
