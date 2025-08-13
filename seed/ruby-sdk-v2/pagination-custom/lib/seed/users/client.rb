
module Seed
    module Users
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Users::Client]
            def initialize(client)
                @client = client
            end

            # @return [Seed::UsernameCursor]
            def list_usernames_custom(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "/users"
                )
            end

    end
end
