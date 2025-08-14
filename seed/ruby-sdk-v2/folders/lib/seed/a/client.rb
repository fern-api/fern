
module Seed
    module A
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::A::Client]
            def initialize(client)
                @client = client
            end

    end
end
