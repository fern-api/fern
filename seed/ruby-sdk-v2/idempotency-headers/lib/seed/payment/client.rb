
module Seed
    module Payment
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Payment::Client]
            def initialize(client)
                @client = client
            end

            # @return [String]
            def create
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [untyped]
            def delete
                raise NotImplementedError, 'This method is not yet implemented.'
            end

    end
end
