
module Seed
    module User
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::User::Client]
            def initialize(client)
                @client = client
            end

            # @return [untyped]
            def get_user
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::user::User]
            def create_user
                raise NotImplementedError, 'This method is not yet implemented.'
            end
        end
    end
end
