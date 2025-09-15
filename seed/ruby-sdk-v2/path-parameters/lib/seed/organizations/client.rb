# frozen_string_literal: true

module Seed
  module Organizations
    class Client
      # @return [Seed::Organizations::Client]
      def initialize(client:)
        @client = client
      end

      # @return [Seed::Organizations::Types::Organization]
      def get_organization(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "GET",
          path: "/#{params[:tenant_id]}/organizations/#{params[:organization_id]}/"
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::Organizations::Types::Organization.load(_response.body)
        end

        raise _response.body
      end

      # @return [Seed::User::Types::User]
      def get_organization_user(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "GET",
          path: "/#{params[:tenant_id]}/organizations/#{params[:organization_id]}/users/#{params[:user_id]}"
        )
        _response = @client.send(_request)
        return Seed::User::Types::User.load(_response.body) if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # @return [Array[Seed::Organizations::Types::Organization]]
      def search_organizations(request_options: {}, **params)
        _query_param_names = [
          ["limit"],
          %i[limit]
        ].flatten
        _query = params.slice(*_query_param_names)
        params = params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "GET",
          path: "/#{params[:tenant_id]}/organizations/#{params[:organization_id]}/search",
          query: _query
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end
    end
  end
end
