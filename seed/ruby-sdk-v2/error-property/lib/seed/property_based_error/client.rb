
module Seed
    module PropertyBasedError
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::PropertyBasedError::Client]
            def initialize(client)
                @client = client
            end

            # @return [String]
            def throw_error
                raise NotImplementedError, 'This method is not yet implemented.'
            end

    end
end
