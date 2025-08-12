
module Seed
    module NoAuth
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::NoAuth::Client]
            def initialize(client)
                @client = client
            end

            # @return [untyped]
            def post_with_no_auth
                raise NotImplementedError, 'This method is not yet implemented.'
            end
        end
    end
end
