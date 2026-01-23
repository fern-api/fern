# frozen_string_literal: true

module FernOauthClientCredentialsReference
  module Simple
    class Client
      # @param client [FernOauthClientCredentialsReference::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [untyped]
      def get_something(request_options: {}, **params)
        FernOauthClientCredentialsReference::Internal::Types::Utils.normalize_keys(params)
        request = FernOauthClientCredentialsReference::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/get-something",
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernOauthClientCredentialsReference::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernOauthClientCredentialsReference::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end
    end
  end
end
