
module Seed
    module Endpoints
        module Union
            class Client
                # @option client [Seed::Internal::Http::RawClient]
                #
                # @return [Seed::Endpoints::Union::Client]
                def initialize(client)
                    @client = client
                end

                # @return [void]
                def get_and_return_union; end
            end
        end
    end
end
