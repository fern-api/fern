
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

                # @return [untyped]
                def add
                    raise NotImplementedError, 'This method is not yet implemented.'
                end
            end
        end
    end
end
