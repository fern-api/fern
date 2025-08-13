
module Seed
    module CustomAuth
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::CustomAuth::Client]
            def initialize(client)
                @client = client
            end

            # @return [bool]
            def get_with_custom_auth
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [bool]
            def post_with_custom_auth
                raise NotImplementedError, 'This method is not yet implemented.'
            end

    end
end
