
module Seed
    module File
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::File::Client]
            def initialize(client)
                @client = client
            end

    end
end
