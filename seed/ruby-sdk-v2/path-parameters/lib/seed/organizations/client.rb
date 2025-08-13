
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
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::User::User]
            def get_organization_user(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Array[Seed::Organizations::Organization]]
            def search_organizations(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

    end
end
