
module Seed
    module Organizations
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Organizations::Client]
            def initialize(client)
                @client = client
            end

<<<<<<< HEAD
<<<<<<< HEAD
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
=======
            # @return [Seed::organizations::Organization]
=======
            # @return [Seed::Organizations::Organization]
>>>>>>> 51153df442 (fix)
            def get_organization(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::User::User]
            def get_organization_user(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Array[Seed::Organizations::Organization]]
            def search_organizations(request_options: {}, **params)
<<<<<<< HEAD
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "/#{params[:tenant_id]}/organizations/#{params[:organization_id]}/search"
                )
>>>>>>> ca21b06d09 (fix)
=======
                raise NotImplementedError, 'This method is not yet implemented.'
>>>>>>> 51153df442 (fix)
            end

    end
end
