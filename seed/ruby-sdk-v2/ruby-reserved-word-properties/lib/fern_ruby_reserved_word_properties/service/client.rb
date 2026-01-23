# frozen_string_literal: true

module FernRubyReservedWordProperties
  module Service
    class Client
      # @param client [FernRubyReservedWordProperties::Internal::Http::RawClient]
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
      # @return [FernRubyReservedWordProperties::Service::Types::Foo]
      def get(request_options: {}, **params)
        FernRubyReservedWordProperties::Internal::Types::Utils.normalize_keys(params)
        request = FernRubyReservedWordProperties::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/ruby-reserved-word-properties/getFoo",
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernRubyReservedWordProperties::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          FernRubyReservedWordProperties::Service::Types::Foo.load(response.body)
        else
          error_class = FernRubyReservedWordProperties::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end
    end
  end
end
