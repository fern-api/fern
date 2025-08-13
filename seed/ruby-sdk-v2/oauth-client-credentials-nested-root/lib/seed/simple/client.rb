
module Seed
    module Simple
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Simple::Client]
            def initialize(client)
                @client = client
            end

            # @return [untyped]
            def get_something(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

    end
end
