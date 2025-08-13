
module Seed
    module User
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::User::Client]
            def initialize(client)
                @client = client
            end

            # Retrieve a user.
            # This endpoint is used to retrieve a user.
            #
            # @return [untyped]
            def get_user(request_options: {}, **params)
<<<<<<< HEAD
                raise NotImplementedError, 'This method is not yet implemented.'
=======
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "users/#{params[:userId]}"
                )
>>>>>>> ca21b06d09 (fix)
            end

            # Create a new user.
            # This endpoint is used to create a new user.
            #
<<<<<<< HEAD
            # @return [Seed::User::User]
            def create_user(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
=======
            # @return [Seed::user::User]
            def create_user(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "users"
                )
>>>>>>> ca21b06d09 (fix)
            end

    end
end
