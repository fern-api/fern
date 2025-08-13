
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
            # @return [Array[Seed::User::User]]
            def get(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
=======
            # @return [Array[Seed::user::User]]
            def get(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "users"
                )
>>>>>>> ca21b06d09 (fix)
=======
            # @return [Array[Seed::User::User]]
            def get(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
>>>>>>> 51153df442 (fix)
            end

    end
end
