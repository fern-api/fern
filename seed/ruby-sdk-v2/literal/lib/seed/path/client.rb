
module Seed
    module Path
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Path::Client]
            def initialize(client)
                @client = client
            end

            # @return [Seed::SendResponse]
            def send
                raise NotImplementedError, 'This method is not yet implemented.'
            end

    end
end
