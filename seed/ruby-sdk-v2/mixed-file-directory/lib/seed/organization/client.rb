
module Seed
    module Organization
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Organization::Client]
            def initialize(client)
                @client = client
            end

            # @return [Seed::organization::Organization]
            def create
                raise NotImplementedError, 'This method is not yet implemented.'
            end
        end
    end
end
