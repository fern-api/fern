
module Seed
    module PropertyBasedError
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::PropertyBasedError::Client]
            def initialize(client)
                @client = client
            end

            # GET request that always throws an error
            #
            # @return [String]
            def throw_error(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

    end
end
