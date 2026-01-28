# frozen_string_literal: true

module FernOauthClientCredentialsEnvironmentVariables
  module Auth
    class Client
      # @param client [FernOauthClientCredentialsEnvironmentVariables::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @param request_options [Hash]
      # @param params [FernOauthClientCredentialsEnvironmentVariables::Auth::Types::GetTokenRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [FernOauthClientCredentialsEnvironmentVariables::Auth::Types::TokenResponse]
      def get_token_with_client_credentials(request_options: {}, **params)
        params = FernOauthClientCredentialsEnvironmentVariables::Internal::Types::Utils.normalize_keys(params)
        request = FernOauthClientCredentialsEnvironmentVariables::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/token",
          body: FernOauthClientCredentialsEnvironmentVariables::Auth::Types::GetTokenRequest.new(params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernOauthClientCredentialsEnvironmentVariables::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          FernOauthClientCredentialsEnvironmentVariables::Auth::Types::TokenResponse.load(response.body)
        else
          error_class = FernOauthClientCredentialsEnvironmentVariables::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end

      # @param request_options [Hash]
      # @param params [FernOauthClientCredentialsEnvironmentVariables::Auth::Types::RefreshTokenRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [FernOauthClientCredentialsEnvironmentVariables::Auth::Types::TokenResponse]
      def refresh_token(request_options: {}, **params)
        params = FernOauthClientCredentialsEnvironmentVariables::Internal::Types::Utils.normalize_keys(params)
        request = FernOauthClientCredentialsEnvironmentVariables::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/token",
          body: FernOauthClientCredentialsEnvironmentVariables::Auth::Types::RefreshTokenRequest.new(params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernOauthClientCredentialsEnvironmentVariables::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          FernOauthClientCredentialsEnvironmentVariables::Auth::Types::TokenResponse.load(response.body)
        else
          error_class = FernOauthClientCredentialsEnvironmentVariables::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end
    end
  end
end
