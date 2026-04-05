# frozen_string_literal: true

module <%= gem_namespace %>
  module Internal
    module Multipart
      # @api private
      class Request < <%= gem_namespace %>::Internal::Http::BaseRequest
        attr_reader :body

        # @param base_url [String] The base URL for the request
        # @param path [String] The path for the request
        # @param method [Symbol] The HTTP method for the request (:get, :post, etc.)
        # @param headers [Hash] Additional headers for the request (optional)
        # @param query [Hash] Query parameters for the request (optional)
        # @param body [MultipartFormData, nil] The multipart form data for the request (optional)
        # @param request_options [<%= gem_namespace %>::RequestOptions, Hash{Symbol=>Object}, nil]
        def initialize(base_url:, path:, method:, headers: {}, query: {}, body: nil, request_options: {})
          super(base_url:, path:, method:, headers:, query:, request_options:)

          @body = body
        end

        # @return [Hash] The encoded HTTP request headers.
        # @param protected_keys [Array<String>] Header keys set by the SDK client (e.g. auth, metadata)
        #   that must not be overridden by additional_headers from request_options.
        def encode_headers(protected_keys: [])
          sdk_headers = {
            "Content-Type" => @body.content_type
          }.merge(@headers)
          merge_additional_headers(sdk_headers, protected_keys:)
        end

        # @return [String, nil] The encoded HTTP request body.
        def encode_body
          @body&.encode
        end
      end
    end
  end
end 