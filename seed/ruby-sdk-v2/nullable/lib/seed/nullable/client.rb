
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
            end

            # @return [bool]
            def delete_user(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: DELETE,
                    path: "/users"
                )
            end

    end
end
