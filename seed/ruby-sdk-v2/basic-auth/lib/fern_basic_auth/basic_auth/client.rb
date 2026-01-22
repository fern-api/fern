# frozen_string_literal: true

module FernBasicAuth
  module BasicAuth
    class Client
      # @param client [FernBasicAuth::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # GET request with basic auth scheme
      #
      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [Boolean]
      def get_with_basic_auth(request_options: {}, **params)
        FernBasicAuth::Internal::Types::Utils.normalize_keys(params)
        request = FernBasicAuth::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "basic-auth",
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernBasicAuth::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernBasicAuth::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end

      # POST request with basic auth scheme
      #
      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [Boolean]
      def post_with_basic_auth(request_options: {}, **params)
        params = FernBasicAuth::Internal::Types::Utils.normalize_keys(params)
        request = FernBasicAuth::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "basic-auth",
          body: params,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernBasicAuth::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernBasicAuth::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end
    end
  end
end
