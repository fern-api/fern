# frozen_string_literal: true

require_relative "../../../requests"
require_relative "../../types/object/types/object_with_optional_field"
require "async"

module SeedExhaustiveClient
  module Endpoints
    class ContentTypeClient
      # @return [SeedExhaustiveClient::RequestClient]
      attr_reader :request_client

      # @param request_client [SeedExhaustiveClient::RequestClient]
      # @return [SeedExhaustiveClient::Endpoints::ContentTypeClient]
      def initialize(request_client:)
        @request_client = request_client
      end

      # @param request [Hash] Request of type SeedExhaustiveClient::Types::Object_::ObjectWithOptionalField, as a Hash
      #   * :string (String)
      #   * :integer (Integer)
      #   * :long (Long)
      #   * :double (Float)
      #   * :bool (Boolean)
      #   * :datetime (DateTime)
      #   * :date (Date)
      #   * :uuid (String)
      #   * :base_64 (String)
      #   * :list (Array<String>)
      #   * :set (Set<String>)
      #   * :map (Hash{Integer => String})
      #   * :bigint (String)
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [Void]
      # @example
      #  exhaustive = SeedExhaustiveClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
      #  exhaustive.endpoints.content_type.post_json_patch_content_type(request: { string: "string", integer: 1, long: 1000000, double: 1.1, bool: true, datetime: DateTime.parse("2024-01-15T09:30:00.000Z"), date: Date.parse("2023-01-15"), uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32", base_64: "SGVsbG8gd29ybGQh", list: ["list", "list"], set: Set["set"], map: { 1: "map" }, bigint: "1000000" })
      def post_json_patch_content_type(request:, request_options: nil)
        @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/foo/bar"
        end
      end

      # @param request [Hash] Request of type SeedExhaustiveClient::Types::Object_::ObjectWithOptionalField, as a Hash
      #   * :string (String)
      #   * :integer (Integer)
      #   * :long (Long)
      #   * :double (Float)
      #   * :bool (Boolean)
      #   * :datetime (DateTime)
      #   * :date (Date)
      #   * :uuid (String)
      #   * :base_64 (String)
      #   * :list (Array<String>)
      #   * :set (Set<String>)
      #   * :map (Hash{Integer => String})
      #   * :bigint (String)
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [Void]
      # @example
      #  exhaustive = SeedExhaustiveClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
      #  exhaustive.endpoints.content_type.post_json_patch_content_with_charset_type(request: { string: "string", integer: 1, long: 1000000, double: 1.1, bool: true, datetime: DateTime.parse("2024-01-15T09:30:00.000Z"), date: Date.parse("2023-01-15"), uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32", base_64: "SGVsbG8gd29ybGQh", list: ["list", "list"], set: Set["set"], map: { 1: "map" }, bigint: "1000000" })
      def post_json_patch_content_with_charset_type(request:, request_options: nil)
        @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/foo/baz"
        end
      end
    end

    class AsyncContentTypeClient
      # @return [SeedExhaustiveClient::AsyncRequestClient]
      attr_reader :request_client

      # @param request_client [SeedExhaustiveClient::AsyncRequestClient]
      # @return [SeedExhaustiveClient::Endpoints::AsyncContentTypeClient]
      def initialize(request_client:)
        @request_client = request_client
      end

      # @param request [Hash] Request of type SeedExhaustiveClient::Types::Object_::ObjectWithOptionalField, as a Hash
      #   * :string (String)
      #   * :integer (Integer)
      #   * :long (Long)
      #   * :double (Float)
      #   * :bool (Boolean)
      #   * :datetime (DateTime)
      #   * :date (Date)
      #   * :uuid (String)
      #   * :base_64 (String)
      #   * :list (Array<String>)
      #   * :set (Set<String>)
      #   * :map (Hash{Integer => String})
      #   * :bigint (String)
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [Void]
      # @example
      #  exhaustive = SeedExhaustiveClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
      #  exhaustive.endpoints.content_type.post_json_patch_content_type(request: { string: "string", integer: 1, long: 1000000, double: 1.1, bool: true, datetime: DateTime.parse("2024-01-15T09:30:00.000Z"), date: Date.parse("2023-01-15"), uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32", base_64: "SGVsbG8gd29ybGQh", list: ["list", "list"], set: Set["set"], map: { 1: "map" }, bigint: "1000000" })
      def post_json_patch_content_type(request:, request_options: nil)
        Async do
          @request_client.conn.post do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = {
          **(req.headers || {}),
          **@request_client.get_headers,
          **(request_options&.additional_headers || {})
            }.compact
            unless request_options.nil? || request_options&.additional_query_parameters.nil?
              req.params = { **(request_options&.additional_query_parameters || {}) }.compact
            end
            req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
            req.url "#{@request_client.get_url(request_options: request_options)}/foo/bar"
          end
        end
      end

      # @param request [Hash] Request of type SeedExhaustiveClient::Types::Object_::ObjectWithOptionalField, as a Hash
      #   * :string (String)
      #   * :integer (Integer)
      #   * :long (Long)
      #   * :double (Float)
      #   * :bool (Boolean)
      #   * :datetime (DateTime)
      #   * :date (Date)
      #   * :uuid (String)
      #   * :base_64 (String)
      #   * :list (Array<String>)
      #   * :set (Set<String>)
      #   * :map (Hash{Integer => String})
      #   * :bigint (String)
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [Void]
      # @example
      #  exhaustive = SeedExhaustiveClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
      #  exhaustive.endpoints.content_type.post_json_patch_content_with_charset_type(request: { string: "string", integer: 1, long: 1000000, double: 1.1, bool: true, datetime: DateTime.parse("2024-01-15T09:30:00.000Z"), date: Date.parse("2023-01-15"), uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32", base_64: "SGVsbG8gd29ybGQh", list: ["list", "list"], set: Set["set"], map: { 1: "map" }, bigint: "1000000" })
      def post_json_patch_content_with_charset_type(request:, request_options: nil)
        Async do
          @request_client.conn.post do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = {
          **(req.headers || {}),
          **@request_client.get_headers,
          **(request_options&.additional_headers || {})
            }.compact
            unless request_options.nil? || request_options&.additional_query_parameters.nil?
              req.params = { **(request_options&.additional_query_parameters || {}) }.compact
            end
            req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
            req.url "#{@request_client.get_url(request_options: request_options)}/foo/baz"
          end
        end
      end
    end
  end
end
