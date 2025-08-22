# frozen_string_literal: true

module Seed
  module Organization
    class Client
      # @return [Seed::Organization::Client]
      def initialize(client:)
        @client = client
      end

      # Create a new organization.
      #
      # @return [Seed::Organization::Types::Organization]
      def create(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "/organizations/",
          body: Seed::Organization::Types::CreateOrganizationRequest.new(params).to_h
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::Organization::Types::Organization.load(_response.body)
        end

        raise _response.body
      end
    end
  end
end
