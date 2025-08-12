
module Seed
    module Users
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Users::Client]
            def initialize(client)
                @client = client
            end

            # @return [Seed::UsernameCursor]
            def list_usernames_custom
                raise NotImplementedError, 'This method is not yet implemented.'
            end
        end
    end
end
