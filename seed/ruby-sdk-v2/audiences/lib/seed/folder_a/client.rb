
module Seed
    module FolderA
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::FolderA::Client]
            def initialize(client)
                @client = client
            end
        end
    end
end
