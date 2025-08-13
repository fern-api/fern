
module Seed
    module Homepage
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Homepage::Client]
            def initialize(client)
                @client = client
            end

            # @return [Array[String]]
            def get_homepage_problems
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [untyped]
            def set_homepage_problems
                raise NotImplementedError, 'This method is not yet implemented.'
            end
        end
    end
end
