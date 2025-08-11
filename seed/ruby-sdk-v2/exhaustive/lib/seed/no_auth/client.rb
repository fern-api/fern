
module Seed
    module NoAuth
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::NoAuth::Client]
            def initialize(client)
                @client = client
            end

            # @return [void]
            def post_with_no_auth; end
        end
    end
end
