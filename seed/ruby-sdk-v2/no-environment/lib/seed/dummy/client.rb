
module Seed
    module Dummy
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Dummy::Client]
            def initialize(client)
                @client = client
            end

            # @return [String]
            def get_dummy
                raise NotImplementedError, 'This method is not yet implemented.'
            end
        end
    end
end
