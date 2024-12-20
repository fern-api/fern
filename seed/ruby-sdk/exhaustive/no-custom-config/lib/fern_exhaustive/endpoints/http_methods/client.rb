# frozen_string_literal: true

require_relative "../../../requests"
require "json"
require_relative "../../types/object/types/object_with_required_field"
require_relative "../../types/object/types/object_with_optional_field"
require "async"

module SeedExhaustiveClient
  module Endpoints
    class HttpMethodsClient
      # @return [SeedExhaustiveClient::RequestClient]
      attr_reader :request_client

      # @param request_client [SeedExhaustiveClient::RequestClient]
      # @return [SeedExhaustiveClient::Endpoints::HttpMethodsClient]
      def initialize(request_client:)
        @request_client = request_client
      end

      # @param id [String]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [String]
      # @example
      #  exhaustive = SeedExhaustiveClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
      #  exhaustive.endpoints.http_methods.test_get(id: "id")
      def test_get(id:, request_options: nil)
        response = @request_client.conn.get do |req|
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
          unless request_options.nil? || request_options&.additional_body_parameters.nil?
            req.body = { **(request_options&.additional_body_parameters || {}) }.compact
          end
          req.url "#{@request_client.get_url(request_options: request_options)}/http-methods/#{id}"
        end
        JSON.parse(response.body)
      end

      # @param request [Hash] Request of type SeedExhaustiveClient::Types::Object_::ObjectWithRequiredField, as a Hash
      #   * :string (String)
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [SeedExhaustiveClient::Types::Object_::ObjectWithOptionalField]
      # @example
      #  exhaustive = SeedExhaustiveClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
      #  exhaustive.endpoints.http_methods.test_post(request: { string: "string" })
      def test_post(request:, request_options: nil)
        response = @request_client.conn.post do |req|
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
          req.url "#{@request_client.get_url(request_options: request_options)}/http-methods"
        end
        SeedExhaustiveClient::Types::Object_::ObjectWithOptionalField.from_json(json_object: response.body)
      end

      # @param id [String]
      # @param request [Hash] Request of type SeedExhaustiveClient::Types::Object_::ObjectWithRequiredField, as a Hash
      #   * :string (String)
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [SeedExhaustiveClient::Types::Object_::ObjectWithOptionalField]
      # @example
      #  exhaustive = SeedExhaustiveClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
      #  exhaustive.endpoints.http_methods.test_put(id: "id", request: { string: "string" })
      def test_put(id:, request:, request_options: nil)
        response = @request_client.conn.put do |req|
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
          req.url "#{@request_client.get_url(request_options: request_options)}/http-methods/#{id}"
        end
        SeedExhaustiveClient::Types::Object_::ObjectWithOptionalField.from_json(json_object: response.body)
      end

      # @param id [String]
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
      # @return [SeedExhaustiveClient::Types::Object_::ObjectWithOptionalField]
      # @example
      #  exhaustive = SeedExhaustiveClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
      #  exhaustive.endpoints.http_methods.test_patch(id: "id", request: { string: "string", integer: 1, long: 1000000, double: 1.1, bool: true, datetime: DateTime.parse("2024-01-15T09:30:00.000Z"), date: Date.parse("2023-01-15"), uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32", base_64: "SGVsbG8gd29ybGQh", list: ["list", "list"], set: Set["set"], map: { 1: "map" }, bigint: "1000000" })
      def test_patch(id:, request:, request_options: nil)
        response = @request_client.conn.patch do |req|
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
          req.url "#{@request_client.get_url(request_options: request_options)}/http-methods/#{id}"
        end
        SeedExhaustiveClient::Types::Object_::ObjectWithOptionalField.from_json(json_object: response.body)
      end

      # @param id [String]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [Boolean]
      # @example
      #  exhaustive = SeedExhaustiveClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
      #  exhaustive.endpoints.http_methods.test_delete(id: "id")
      def test_delete(id:, request_options: nil)
        response = @request_client.conn.delete do |req|
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
          unless request_options.nil? || request_options&.additional_body_parameters.nil?
            req.body = { **(request_options&.additional_body_parameters || {}) }.compact
          end
          req.url "#{@request_client.get_url(request_options: request_options)}/http-methods/#{id}"
        end
        JSON.parse(response.body)
      end
    end

    class AsyncHttpMethodsClient
      # @return [SeedExhaustiveClient::AsyncRequestClient]
      attr_reader :request_client

      # @param request_client [SeedExhaustiveClient::AsyncRequestClient]
      # @return [SeedExhaustiveClient::Endpoints::AsyncHttpMethodsClient]
      def initialize(request_client:)
        @request_client = request_client
      end

      # @param id [String]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [String]
      # @example
      #  exhaustive = SeedExhaustiveClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
      #  exhaustive.endpoints.http_methods.test_get(id: "id")
      def test_get(id:, request_options: nil)
        Async do
          response = @request_client.conn.get do |req|
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
            unless request_options.nil? || request_options&.additional_body_parameters.nil?
              req.body = { **(request_options&.additional_body_parameters || {}) }.compact
            end
            req.url "#{@request_client.get_url(request_options: request_options)}/http-methods/#{id}"
          end
          parsed_json = JSON.parse(response.body)
          parsed_json
        end
      end

      # @param request [Hash] Request of type SeedExhaustiveClient::Types::Object_::ObjectWithRequiredField, as a Hash
      #   * :string (String)
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [SeedExhaustiveClient::Types::Object_::ObjectWithOptionalField]
      # @example
      #  exhaustive = SeedExhaustiveClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
      #  exhaustive.endpoints.http_methods.test_post(request: { string: "string" })
      def test_post(request:, request_options: nil)
        Async do
          response = @request_client.conn.post do |req|
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
            req.url "#{@request_client.get_url(request_options: request_options)}/http-methods"
          end
          SeedExhaustiveClient::Types::Object_::ObjectWithOptionalField.from_json(json_object: response.body)
        end
      end

      # @param id [String]
      # @param request [Hash] Request of type SeedExhaustiveClient::Types::Object_::ObjectWithRequiredField, as a Hash
      #   * :string (String)
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [SeedExhaustiveClient::Types::Object_::ObjectWithOptionalField]
      # @example
      #  exhaustive = SeedExhaustiveClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
      #  exhaustive.endpoints.http_methods.test_put(id: "id", request: { string: "string" })
      def test_put(id:, request:, request_options: nil)
        Async do
          response = @request_client.conn.put do |req|
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
            req.url "#{@request_client.get_url(request_options: request_options)}/http-methods/#{id}"
          end
          SeedExhaustiveClient::Types::Object_::ObjectWithOptionalField.from_json(json_object: response.body)
        end
      end

      # @param id [String]
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
      # @return [SeedExhaustiveClient::Types::Object_::ObjectWithOptionalField]
      # @example
      #  exhaustive = SeedExhaustiveClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
      #  exhaustive.endpoints.http_methods.test_patch(id: "id", request: { string: "string", integer: 1, long: 1000000, double: 1.1, bool: true, datetime: DateTime.parse("2024-01-15T09:30:00.000Z"), date: Date.parse("2023-01-15"), uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32", base_64: "SGVsbG8gd29ybGQh", list: ["list", "list"], set: Set["set"], map: { 1: "map" }, bigint: "1000000" })
      def test_patch(id:, request:, request_options: nil)
        Async do
          response = @request_client.conn.patch do |req|
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
            req.url "#{@request_client.get_url(request_options: request_options)}/http-methods/#{id}"
          end
          SeedExhaustiveClient::Types::Object_::ObjectWithOptionalField.from_json(json_object: response.body)
        end
      end

      # @param id [String]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [Boolean]
      # @example
      #  exhaustive = SeedExhaustiveClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
      #  exhaustive.endpoints.http_methods.test_delete(id: "id")
      def test_delete(id:, request_options: nil)
        Async do
          response = @request_client.conn.delete do |req|
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
            unless request_options.nil? || request_options&.additional_body_parameters.nil?
              req.body = { **(request_options&.additional_body_parameters || {}) }.compact
            end
            req.url "#{@request_client.get_url(request_options: request_options)}/http-methods/#{id}"
          end
          parsed_json = JSON.parse(response.body)
          parsed_json
        end
      end
    end
  end
end
