
module Seed
    module Nullable
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Nullable::Client]
            def initialize(client)
                @client = client
            end

<<<<<<< HEAD
            # @return [Array[Seed::Nullable::User]]
            def get_users(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::Nullable::User]
            def create_user(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
=======
            # @return [Array[Seed::nullable::User]]
            def get_users(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "/users"
                )
            end

            # @return [Seed::nullable::User]
            def create_user(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/users"
                )
>>>>>>> ca21b06d09 (fix)
            end

            # @return [bool]
            def delete_user(request_options: {}, **params)
<<<<<<< HEAD
                raise NotImplementedError, 'This method is not yet implemented.'
=======
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: DELETE,
                    path: "/users"
                )
>>>>>>> ca21b06d09 (fix)
            end

    end
end
