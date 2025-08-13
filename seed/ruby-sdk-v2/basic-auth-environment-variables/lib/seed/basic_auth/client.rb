
module Seed
    module BasicAuth
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::BasicAuth::Client]
            def initialize(client)
                @client = client
            end

            # @return [bool]
            def get_with_basic_auth
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [bool]
            def post_with_basic_auth
                raise NotImplementedError, 'This method is not yet implemented.'
            end

    end
end
