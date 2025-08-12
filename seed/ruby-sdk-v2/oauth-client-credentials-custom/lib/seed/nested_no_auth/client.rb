
module Seed
    module NestedNoAuth
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::NestedNoAuth::Client]
            def initialize(client)
                @client = client
            end
        end
    end
end
