
module Seed
    module Organizations
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Organizations::Client]
            def initialize(client)
                @client = client
            end

            # @return [Seed::Organizations::Organization]
            def get_organization(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return Seed::Organizations::Types::Organization.load(_response.body)

                else
                    raise _response.body
            end

            # @return [Seed::User::User]
            def get_organization_user(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return Seed::User::Types::User.load(_response.body)

                else
                    raise _response.body
            end

            # @return [Array[Seed::Organizations::Organization]]
            def search_organizations(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return 
                else
                    raise _response.body
            end

    end
end
