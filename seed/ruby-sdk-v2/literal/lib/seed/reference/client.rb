
module Seed
    module Reference
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Reference::Client]
            def initialize(client)
                @client = client
            end

            # @return [Seed::SendResponse]
            def send
                raise NotImplementedError, 'This method is not yet implemented.'
            end
        end
    end
end
