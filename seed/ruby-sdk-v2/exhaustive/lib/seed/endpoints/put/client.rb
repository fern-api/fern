
module Seed
    module Endpoints
        module Put
            class Client
                # @option client [Seed::Internal::Http::RawClient]
                #
                # @return [Seed::Endpoints::Put::Client]
                def initialize(client)
                    @client = client
                end

                # @return [void]
                def add; end
            end
        end
    end
end
