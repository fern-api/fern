# frozen_string_literal: true

module FernOauthClientCredentialsNestedRoot
  module Auth
    class Client
      # @param client [FernOauthClientCredentialsNestedRoot::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @param request_options [Hash]
      # @param params [FernOauthClientCredentialsNestedRoot::Auth::Types::GetTokenRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [FernOauthClientCredentialsNestedRoot::Auth::Types::TokenResponse]
      def get_token(request_options: {}, **params)
        params = FernOauthClientCredentialsNestedRoot::Internal::Types::Utils.normalize_keys(params)
        body_prop_names = %i[client_id client_secret audience grant_type scope]
        body_bag = params.slice(*body_prop_names)

        request = FernOauthClientCredentialsNestedRoot::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/token",
          body: FernOauthClientCredentialsNestedRoot::Auth::Types::GetTokenRequest.new(body_bag).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernOauthClientCredentialsNestedRoot::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          FernOauthClientCredentialsNestedRoot::Auth::Types::TokenResponse.load(response.body)
        else
          error_class = FernOauthClientCredentialsNestedRoot::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end
    end
  end
end
