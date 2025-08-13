
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
                _request = params

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return 
                else
                    raise _response.body
            end

            # @return [Seed::Nullable::User]
            def create_user(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return Seed::Nullable::Types::User.load(_response.body)

                else
                    raise _response.body
            end

            # @return [bool]
            def delete_user(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return 
                else
                    raise _response.body
            end

    end
end
