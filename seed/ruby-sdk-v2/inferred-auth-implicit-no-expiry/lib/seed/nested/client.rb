
module Seed
    module Nested
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Nested::Client]
            def initialize(client)
                @client = client
            end

    end
end
