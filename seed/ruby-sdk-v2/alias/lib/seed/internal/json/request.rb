# frozen_string_literal: true

module Seed
  module Internal
    module JSON
      # @api private
      class Request < Seed::Internal::Http::BaseRequest
        attr_reader :body

        # @param base_url [String] The base URL for the request
        # @param path [String] The path for the request
        # @param method [Symbol] The HTTP method for the request (:get, :post, etc.)
        # @param headers [Hash] Additional headers for the request (optional)
        # @param query [Hash] Query parameters for the request (optional)
        # @param body [Object, nil] The JSON request body (optional)
        # @param request_options [Seed::RequestOptions, Hash{Symbol=>Object}, nil]
        def initialize(base_url:, path:, method:, headers: {}, query: {}, body: nil, request_options: {})
          super(base_url:, path:, method:, headers:, query:, request_options:)

          @body = body
        end

        # @return [Hash] The encoded HTTP request headers.
        # @param protected_keys [Array<String>] Header keys set by the SDK client (e.g. auth, metadata)
        #   that must not be overridden by additional_headers from request_options.
        def encode_headers(protected_keys: [])
          sdk_headers = {
            "Content-Type" => "application/json",
            "Accept" => "application/json"
          }.merge(@headers)
          merge_additional_headers(sdk_headers, protected_keys:)
        end

        # @return [String, nil] The encoded HTTP request body, including any additional_body_parameters
        #   from request_options.
        def encode_body
          body = request_body
          body.nil? ? nil : ::JSON.generate(serialize_times(body))
        end

        private

        # @return [Object, nil] The request body merged with additional_body_parameters.
        def request_body
          merge_additional_body_parameters(@body)
        end

        # ::JSON.generate falls back to `to_s` for Time-like values (e.g. "2026-10-16 01:40:16 UTC"),
        # so convert Time, DateTime, Date, and ActiveSupport::TimeWithZone values to ISO 8601 strings first.
        #
        # @param value [Object]
        # @return [Object]
        def serialize_times(value)
          case value
          when ::Hash
            value.transform_values { |item| serialize_times(item) }
          when ::Array
            value.map { |item| serialize_times(item) }
          else
            return value unless value.respond_to?(:iso8601)

            value.respond_to?(:hour) ? value.iso8601(3) : value.iso8601
          end
        end
      end
    end
  end
end
