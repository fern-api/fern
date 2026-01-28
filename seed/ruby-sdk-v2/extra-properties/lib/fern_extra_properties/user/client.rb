# frozen_string_literal: true

module FernExtraProperties
  module User
    class Client
      # @param client [FernExtraProperties::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @param request_options [Hash]
      # @param params [FernExtraProperties::User::Types::CreateUserRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [FernExtraProperties::User::Types::User]
      def create_user(request_options: {}, **params)
        params = FernExtraProperties::Internal::Types::Utils.normalize_keys(params)
        request = FernExtraProperties::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/user",
          body: FernExtraProperties::User::Types::CreateUserRequest.new(params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernExtraProperties::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          FernExtraProperties::User::Types::User.load(response.body)
        else
          error_class = FernExtraProperties::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end
    end
  end
end
