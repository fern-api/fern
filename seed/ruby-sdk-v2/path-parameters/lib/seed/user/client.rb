
module Seed
    module User
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::User::Client]
            def initialize(client)
                @client = client
            end

<<<<<<< HEAD
<<<<<<< HEAD
            # @return [Seed::User::User]
            def get_user(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::User::User]
=======
            # @return [Seed::user::User]
=======
            # @return [Seed::User::User]
>>>>>>> 51153df442 (fix)
            def get_user(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

<<<<<<< HEAD
            # @return [Seed::user::User]
>>>>>>> ca21b06d09 (fix)
=======
            # @return [Seed::User::User]
>>>>>>> 51153df442 (fix)
            def create_user(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/#{params[:tenant_id]}/user/"
                )
<<<<<<< HEAD
            end

            # @return [Seed::User::User]
            def update_user(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Array[Seed::User::User]]
            def search_users(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
=======
            end

            # @return [Seed::User::User]
            def update_user(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Array[Seed::User::User]]
            def search_users(request_options: {}, **params)
<<<<<<< HEAD
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "/#{params[:tenant_id]}/user/#{params[:user_id]}/search"
                )
>>>>>>> ca21b06d09 (fix)
=======
                raise NotImplementedError, 'This method is not yet implemented.'
>>>>>>> 51153df442 (fix)
            end

    end
end
