
module Seed
    module V2
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::V2::Client]
            def initialize(client)
                @client = client
            end

            # @return [untyped]
            def test(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

    end
end
