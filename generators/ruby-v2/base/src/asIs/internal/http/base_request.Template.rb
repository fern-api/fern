# frozen_string_literal: true

module <%= gem_namespace %>
  module Internal
    module Http
      # @api private
      class BaseRequest
        attr_reader :base_url, :path, :method, :headers, :query, :request_options

        # @param base_url [String] The base URL for the request
        # @param path [String] The path for the request
        # @param method [String] The HTTP method for the request (:get, :post, etc.)
        # @param headers [Hash] Additional headers for the request (optional)
        # @param query [Hash] Query parameters for the request (optional)
        # @param request_options [<%= gem_namespace %>::RequestOptions, Hash{Symbol=>Object}, nil]
        def initialize(base_url:, path:, method:, headers: {}, query: {}, request_options: {})
          @base_url = base_url
          @path = path
          @method = method
          @headers = headers
          @query = query
          @request_options = request_options
        end

        # @return [Hash] The query parameters merged with additional query parameters from request options.
        def encode_query
          additional_query = @request_options&.dig(:additional_query_parameters) || @request_options&.dig("additional_query_parameters") || {}
          @query.merge(additional_query)
        end

        # Child classes should implement:
        # - encode_headers: Returns the encoded HTTP request headers.
        # - encode_body: Returns the encoded HTTP request body.

        private

        # Merges additional_headers from request_options into sdk_headers, filtering out
        # any keys that collide with SDK-set or client-protected headers (case-insensitive).
        # @param sdk_headers [Hash] Headers set by the SDK for this request type.
        # @param protected_keys [Array<String>] Additional header keys that must not be overridden.
        # @return [Hash] The merged headers.
        def merge_additional_headers(sdk_headers, protected_keys: [])
          additional_headers = @request_options&.dig(:additional_headers) || @request_options&.dig("additional_headers") || {}
          all_protected = (sdk_headers.keys + protected_keys).map { |k| k.to_s.downcase }.to_set
          filtered = additional_headers.reject { |key, _| all_protected.include?(key.to_s.downcase) }
          sdk_headers.merge(filtered)
        end
      end
    end
  end
end  