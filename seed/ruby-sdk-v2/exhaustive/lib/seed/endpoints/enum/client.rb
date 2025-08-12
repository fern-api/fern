
module Seed
    module Endpoints
        module Enum
            class Client
                # @option client [Seed::Internal::Http::RawClient]
                #
                # @return [Seed::Endpoints::Enum::Client]
                def initialize(client)
                    @client = client
                end

                # @return [untyped]
                def get_and_return_enum
                    raise NotImplementedError, 'This method is not yet implemented.'
                end
            end
        end
    end
end
