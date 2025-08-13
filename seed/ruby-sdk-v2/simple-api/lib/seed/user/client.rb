
module Seed
    module User
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::User::Client]
            def initialize(client)
                @client = client
            end

            # @return [Seed::user::User]
            def get(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "/users/#{params[:id]}"
                )
            end

    end
end
