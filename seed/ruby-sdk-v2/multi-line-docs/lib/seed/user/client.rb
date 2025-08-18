
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
                _request = params

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return

                else
                    raise _response.body
            end

            # Create a new user.
            # This endpoint is used to create a new user.
            #
            # @return [Seed::User::User]
            def create_user(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return Seed::User::Types::User.load(_response.body)

                else
                    raise _response.body
            end

    end
end
