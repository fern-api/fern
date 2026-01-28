# frozen_string_literal: true

module FernOauthClientCredentials
  module Auth
    class Client
      # @param client [FernOauthClientCredentials::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @param request_options [Hash]
      # @param params [FernOauthClientCredentials::Auth::Types::GetTokenRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [FernOauthClientCredentials::Auth::Types::TokenResponse]
      def get_token_with_client_credentials(request_options: {}, **params)
        params = FernOauthClientCredentials::Internal::Types::Utils.normalize_keys(params)
        request = FernOauthClientCredentials::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/token",
          body: FernOauthClientCredentials::Auth::Types::GetTokenRequest.new(params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernOauthClientCredentials::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          FernOauthClientCredentials::Auth::Types::TokenResponse.load(response.body)
        else
          error_class = FernOauthClientCredentials::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end

      # @param request_options [Hash]
      # @param params [FernOauthClientCredentials::Auth::Types::RefreshTokenRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [FernOauthClientCredentials::Auth::Types::TokenResponse]
      def refresh_token(request_options: {}, **params)
        params = FernOauthClientCredentials::Internal::Types::Utils.normalize_keys(params)
        request = FernOauthClientCredentials::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/token",
          body: FernOauthClientCredentials::Auth::Types::RefreshTokenRequest.new(params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernOauthClientCredentials::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          FernOauthClientCredentials::Auth::Types::TokenResponse.load(response.body)
        else
          error_class = FernOauthClientCredentials::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end
    end
  end
end
