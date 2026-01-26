# frozen_string_literal: true

module FernErrorProperty
  module PropertyBasedError
    class Client
      # @param client [FernErrorProperty::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # GET request that always throws an error
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
      def throw_error(request_options: {}, **params)
        FernErrorProperty::Internal::Types::Utils.normalize_keys(params)
        request = FernErrorProperty::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "property-based-error",
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernErrorProperty::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernErrorProperty::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end
    end
  end
end
