# frozen_string_literal: true

module FernAnyAuth
  module Auth
    class Client
      # @param client [FernAnyAuth::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @param request_options [Hash]
      # @param params [FernAnyAuth::Auth::Types::GetTokenRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [FernAnyAuth::Auth::Types::TokenResponse]
      def get_token(request_options: {}, **params)
        params = FernAnyAuth::Internal::Types::Utils.normalize_keys(params)
        request = FernAnyAuth::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/token",
          body: FernAnyAuth::Auth::Types::GetTokenRequest.new(params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernAnyAuth::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          FernAnyAuth::Auth::Types::TokenResponse.load(response.body)
        else
          error_class = FernAnyAuth::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end
    end
  end
end
