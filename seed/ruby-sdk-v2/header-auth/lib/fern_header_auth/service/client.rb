# frozen_string_literal: true

module FernHeaderAuth
  module Service
    class Client
      # @param client [FernHeaderAuth::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # GET request with custom api key
      #
      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [String]
      def get_with_bearer_token(request_options: {}, **params)
        FernHeaderAuth::Internal::Types::Utils.normalize_keys(params)
        request = FernHeaderAuth::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "apiKey",
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernHeaderAuth::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernHeaderAuth::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end
    end
  end
end
