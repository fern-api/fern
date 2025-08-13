
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
            def get_organization(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "/#{params[:tenant_id]}/organizations/#{params[:organization_id]}/"
                )
            end

            # @return [Seed::user::User]
            def get_organization_user(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "/#{params[:tenant_id]}/organizations/#{params[:organization_id]}/users/#{params[:user_id]}"
                )
            end

            # @return [Array[Seed::organizations::Organization]]
            def search_organizations(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "/#{params[:tenant_id]}/organizations/#{params[:organization_id]}/search"
                )
            end

    end
end
