
module Seed
    module Optional
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Optional::Client]
            def initialize(client)
                @client = client
            end

            # @return [String]
            def send_optional_body
                raise NotImplementedError, 'This method is not yet implemented.'
            end

    end
end
