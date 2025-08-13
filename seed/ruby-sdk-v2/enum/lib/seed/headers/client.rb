
module Seed
    module Headers
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Headers::Client]
            def initialize(client)
                @client = client
            end

            # @return [untyped]
            def send
                raise NotImplementedError, 'This method is not yet implemented.'
            end

    end
end
