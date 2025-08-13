
module Seed
    module User
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::User::Client]
            def initialize(client)
                @client = client
            end

            # @return [Seed::user::User]
            def get_user
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::user::User]
            def create_user
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::user::User]
            def update_user
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Array[Seed::user::User]]
            def search_users
                raise NotImplementedError, 'This method is not yet implemented.'
            end

    end
end
