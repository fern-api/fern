
module Seed
    module Organizations
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Organizations::Client]
            def initialize(client)
                @client = client
            end

            # @return [Seed::organizations::Organization]
            def get_organization
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::user::User]
            def get_organization_user
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Array[Seed::organizations::Organization]]
            def search_organizations
                raise NotImplementedError, 'This method is not yet implemented.'
            end
        end
    end
end
