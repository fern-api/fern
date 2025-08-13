
module Seed
    module Union
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Union::Client]
            def initialize(client)
                @client = client
            end

            # @return [Seed::union::Shape]
            def get
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [bool]
            def update
                raise NotImplementedError, 'This method is not yet implemented.'
            end

    end
end
