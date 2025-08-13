
module Seed
    module User
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::User::Client]
            def initialize(client)
                @client = client
            end

            # List all users.
            #
<<<<<<< HEAD
            # @return [Array[Seed::User::User]]
            def list(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
=======
            # @return [Array[Seed::user::User]]
            def list(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "/users/"
                )
>>>>>>> ca21b06d09 (fix)
            end

    end
end
