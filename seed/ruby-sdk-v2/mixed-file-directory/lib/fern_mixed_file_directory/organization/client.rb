# frozen_string_literal: true

module FernMixedFileDirectory
  module Organization
    class Client
      # @param client [FernMixedFileDirectory::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # Create a new organization.
      #
      # @param request_options [Hash]
      # @param params [FernMixedFileDirectory::Organization::Types::CreateOrganizationRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [FernMixedFileDirectory::Organization::Types::Organization]
      def create(request_options: {}, **params)
        params = FernMixedFileDirectory::Internal::Types::Utils.normalize_keys(params)
        request = FernMixedFileDirectory::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/organizations/",
          body: FernMixedFileDirectory::Organization::Types::CreateOrganizationRequest.new(params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernMixedFileDirectory::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          FernMixedFileDirectory::Organization::Types::Organization.load(response.body)
        else
          error_class = FernMixedFileDirectory::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end
    end
  end
end
