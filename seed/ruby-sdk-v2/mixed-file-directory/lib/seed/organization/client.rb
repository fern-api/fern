
module Seed
    module Organization
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Organization::Client]
            def initialize(client)
                @client = client
            end

            # Create a new organization.
            #
            # @return [Seed::Organization::Organization]
            def create(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/organizations/"
                )

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return Seed::Organization::Types::Organization.load(_response.body)

                else
                    raise _response.body
            end

    end
end
