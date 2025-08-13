
module Seed
    module Nullable
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Nullable::Client]
            def initialize(client)
                @client = client
            end

            # @return [Array[Seed::nullable::User]]
            def get_users
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::nullable::User]
            def create_user
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [bool]
            def delete_user
                raise NotImplementedError, 'This method is not yet implemented.'
            end

    end
end
