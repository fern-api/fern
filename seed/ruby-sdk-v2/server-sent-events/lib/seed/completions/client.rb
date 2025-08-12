
module Seed
    module Completions
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Completions::Client]
            def initialize(client)
                @client = client
            end

            # @return [untyped]
            def stream
                raise NotImplementedError, 'This method is not yet implemented.'
            end
        end
    end
end
