# frozen_string_literal: true

module Seed
  module ReqWithHeaders
    class Client
      # @param client [Seed::Internal::Http::RawClient]
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
      # @option params [String] :x_test_endpoint_header
      #
      # @return [untyped]
      def get_with_custom_header(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        headers = {}
        headers["X-TEST-ENDPOINT-HEADER"] = params[:x_test_endpoint_header] if params[:x_test_endpoint_header]

        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/test-headers/custom-header",
          headers: headers,
          body: params,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = Seed::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end
    end
  end
end
