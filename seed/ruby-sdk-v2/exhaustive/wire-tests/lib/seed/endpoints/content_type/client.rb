# frozen_string_literal: true

module Seed
  module Endpoints
    module ContentType
      class Client
        # @param client [::Seed::Internal::Http::RawClient]
        #
        # @return [void]
        def initialize(client:)
          @client = client
        end

        # @param request_options [::Hash]
        # @param params [::Seed::Types::Object_::Types::ObjectWithOptionalField]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @example
        #   client.endpoints.content_type.post_json_patch_content_type(
        #     string: "string",
        #     integer: 1,
        #     long: 1000000,
        #     double: 1.1,
        #     bool: true,
        #     datetime: "2024-01-15T09:30:00Z",
        #     date: "2023-01-15",
        #     uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
        #     base64: "SGVsbG8gd29ybGQh",
        #     list: %w[list list],
        #     set: Set.new(["set"]),
        #     map: {
        #       1 => "map"
        #     },
        #     bigint: "1000000"
        #   )
        #
        # @return [untyped]
        def post_json_patch_content_type(request_options: {}, **params)
          params = ::Seed::Internal::Types::Utils.normalize_keys(params)
          request = ::Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/foo/bar",
            body: ::Seed::Types::Object_::Types::ObjectWithOptionalField.new(params).to_h,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise ::Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = ::Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [::Hash]
        # @param params [::Seed::Types::Object_::Types::ObjectWithOptionalField]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @example
        #   client.endpoints.content_type.post_json_patch_content_with_charset_type(
        #     string: "string",
        #     integer: 1,
        #     long: 1000000,
        #     double: 1.1,
        #     bool: true,
        #     datetime: "2024-01-15T09:30:00Z",
        #     date: "2023-01-15",
        #     uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
        #     base64: "SGVsbG8gd29ybGQh",
        #     list: %w[list list],
        #     set: Set.new(["set"]),
        #     map: {
        #       1 => "map"
        #     },
        #     bigint: "1000000"
        #   )
        #
        # @return [untyped]
        def post_json_patch_content_with_charset_type(request_options: {}, **params)
          params = ::Seed::Internal::Types::Utils.normalize_keys(params)
          request = ::Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/foo/baz",
            body: ::Seed::Types::Object_::Types::ObjectWithOptionalField.new(params).to_h,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise ::Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = ::Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end
    end
  end
end
