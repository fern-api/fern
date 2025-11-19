# frozen_string_literal: true

module Seed
  module Organization
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [Seed::Organization::Client]
      def initialize(client:)
        @client = client
      end

      # Create a new organization.
      #
      # @param request_options [Seed::RequestOptions]
      #
      # @param params [Seed::Organization::Types::CreateOrganizationRequest]
      #
      # @return [Seed::Organization::Types::Organization]
      def create(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/organizations/",
          body: Seed::Organization::Types::CreateOrganizationRequest.new(params).to_h
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        if code.between?(200, 299)
          Seed::Organization::Types::Organization.load(_response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end
      end
    end
  end
end
