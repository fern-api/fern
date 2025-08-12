
module Seed
    module FolderD
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::FolderD::Client]
            def initialize(client)
                @client = client
            end
        end
    end
end
