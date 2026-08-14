# frozen_string_literal: true

module Seed
  module Token
    class Client
      # @param client [::Seed::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @param request_options [::Hash]
      # @param params [::Seed::Token::Types::GetTokenRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @example
      #   client.token.get_token(
      #     client_id: "client_id",
      #     client_secret: "client_secret",
      #     audience: "https://api.example.com",
      #     grant_type: "client_credentials"
      #   )
      #
      # @return [::Seed::Token::Types::TokenResponse]
      def get_token(request_options: {}, **params)
        params = ::Seed::Internal::Types::Utils.normalize_keys(params)
        headers = @client.auth_headers_for_endpoint(security: nil)
        request = ::Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/token",
          headers: headers,
          body: ::Seed::Token::Types::GetTokenRequest.new(params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise ::Seed::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          ::Seed::Token::Types::TokenResponse.load(response.body)
        else
          error_class = ::Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end
    end
  end
end
