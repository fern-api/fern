
module Seed
    module Nullable
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Nullable::Client]
            def initialize(client)
                @client = client
            end

            # @return [Array[Seed::Nullable::User]]
            def get_users(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::Nullable::User]
            def create_user(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [bool]
            def delete_user(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

    end
end
