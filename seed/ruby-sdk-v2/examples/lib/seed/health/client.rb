
module Seed
    module Health
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Health::Client]
            def initialize(client)
                @client = client
            end

    end
end
