
module Seed
    module User
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::User::Client]
            def initialize(client)
                @client = client
            end

            # @return [untyped]
            def head(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: HEAD,
                    path: "/users"
                )
            end

            # @return [Array[Seed::user::User]]
            def list(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "/users"
                )
            end

    end
end
