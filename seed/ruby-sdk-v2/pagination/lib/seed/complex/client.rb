
module Seed
    module Complex
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Complex::Client]
            def initialize(client)
                @client = client
            end

            # @return [Seed::complex::PaginatedConversationResponse]
            def search
                raise NotImplementedError, 'This method is not yet implemented.'
            end

    end
end
