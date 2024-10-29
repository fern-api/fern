# frozen_string_literal: true

require_relative "../../../requests"
require "json"
require_relative "../../types/object/types/object_with_required_field"
require "set"
require "async"

module SeedExhaustiveClient
  module Endpoints
    class ContainerClient
      # @return [SeedExhaustiveClient::RequestClient]
      attr_reader :request_client

      # @param request_client [SeedExhaustiveClient::RequestClient]
      # @return [SeedExhaustiveClient::Endpoints::ContainerClient]
      def initialize(request_client:)
        @request_client = request_client
      end

      # @param request [Array<String>]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [Array<String>]
      # @example
      #  exhaustive = SeedExhaustiveClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
      #  exhaustive.endpoints.container.get_and_return_list_of_primitives(request: ["string", "string"])
      def get_and_return_list_of_primitives(request:, request_options: nil)
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
          req.url "#{@request_client.get_url(request_options: request_options)}/container/list-of-primitives"
        end
        JSON.parse(response.body)
      end

      # @param request [Array<Hash>] Request of type Array<SeedExhaustiveClient::Types::Object_::ObjectWithRequiredField>, as a Hash
      #   * :string (String)
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [Array<SeedExhaustiveClient::Types::Object_::ObjectWithRequiredField>]
      # @example
      #  exhaustive = SeedExhaustiveClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
      #  exhaustive.endpoints.container.get_and_return_list_of_objects(request: [{ string: "string" }, { string: "string" }])
      def get_and_return_list_of_objects(request:, request_options: nil)
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
          req.url "#{@request_client.get_url(request_options: request_options)}/container/list-of-objects"
        end
        parsed_json = JSON.parse(response.body)
        parsed_json&.map do |item|
          item = item.to_json
          SeedExhaustiveClient::Types::Object_::ObjectWithRequiredField.from_json(json_object: item)
        end
      end

      # @param request [Set<String>]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [Set<String>]
      # @example
      #  exhaustive = SeedExhaustiveClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
      #  exhaustive.endpoints.container.get_and_return_set_of_primitives(request: Set["string"])
      def get_and_return_set_of_primitives(request:, request_options: nil)
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
          req.url "#{@request_client.get_url(request_options: request_options)}/container/set-of-primitives"
        end
        Set.new(response.body)
      end

      # @param request [Set<SeedExhaustiveClient::Types::Object_::ObjectWithRequiredField>]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [Set<SeedExhaustiveClient::Types::Object_::ObjectWithRequiredField>]
      # @example
      #  exhaustive = SeedExhaustiveClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
      #  exhaustive.endpoints.container.get_and_return_set_of_objects(request: Set[{ string: "string" }])
      def get_and_return_set_of_objects(request:, request_options: nil)
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
          req.url "#{@request_client.get_url(request_options: request_options)}/container/set-of-objects"
        end
        Set.new(response.body)
      end

      # @param request [Hash{String => String}]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [Hash{String => String}]
      # @example
      #  exhaustive = SeedExhaustiveClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
      #  exhaustive.endpoints.container.get_and_return_map_prim_to_prim(request: { "string": "string" })
      def get_and_return_map_prim_to_prim(request:, request_options: nil)
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
          req.url "#{@request_client.get_url(request_options: request_options)}/container/map-prim-to-prim"
        end
        JSON.parse(response.body)
      end

      # @param request [Hash{String => SeedExhaustiveClient::Types::Object_::ObjectWithRequiredField}]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [Hash{String => SeedExhaustiveClient::Types::Object_::ObjectWithRequiredField}]
      # @example
      #  exhaustive = SeedExhaustiveClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
      #  exhaustive.endpoints.container.get_and_return_map_of_prim_to_object(request: { "string": { string: "string" } })
      def get_and_return_map_of_prim_to_object(request:, request_options: nil)
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
          req.url "#{@request_client.get_url(request_options: request_options)}/container/map-prim-to-object"
        end
        parsed_json = JSON.parse(response.body)
        parsed_json&.transform_values do |value|
          value = value.to_json
          SeedExhaustiveClient::Types::Object_::ObjectWithRequiredField.from_json(json_object: value)
        end
      end

      # @param request [Hash] Request of type SeedExhaustiveClient::Types::Object_::ObjectWithRequiredField, as a Hash
      #   * :string (String)
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [SeedExhaustiveClient::Types::Object_::ObjectWithRequiredField]
      # @example
      #  exhaustive = SeedExhaustiveClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
      #  exhaustive.endpoints.container.get_and_return_optional(request: { string: "string" })
      def get_and_return_optional(request: nil, request_options: nil)
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
          req.url "#{@request_client.get_url(request_options: request_options)}/container/opt-objects"
        end
        SeedExhaustiveClient::Types::Object_::ObjectWithRequiredField.from_json(json_object: response.body)
      end
    end

    class AsyncContainerClient
      # @return [SeedExhaustiveClient::AsyncRequestClient]
      attr_reader :request_client

      # @param request_client [SeedExhaustiveClient::AsyncRequestClient]
      # @return [SeedExhaustiveClient::Endpoints::AsyncContainerClient]
      def initialize(request_client:)
        @request_client = request_client
      end

      # @param request [Array<String>]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [Array<String>]
      # @example
      #  exhaustive = SeedExhaustiveClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
      #  exhaustive.endpoints.container.get_and_return_list_of_primitives(request: ["string", "string"])
      def get_and_return_list_of_primitives(request:, request_options: nil)
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
            req.url "#{@request_client.get_url(request_options: request_options)}/container/list-of-primitives"
          end
          parsed_json = JSON.parse(response.body)
          parsed_json
        end
      end

      # @param request [Array<Hash>] Request of type Array<SeedExhaustiveClient::Types::Object_::ObjectWithRequiredField>, as a Hash
      #   * :string (String)
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [Array<SeedExhaustiveClient::Types::Object_::ObjectWithRequiredField>]
      # @example
      #  exhaustive = SeedExhaustiveClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
      #  exhaustive.endpoints.container.get_and_return_list_of_objects(request: [{ string: "string" }, { string: "string" }])
      def get_and_return_list_of_objects(request:, request_options: nil)
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
            req.url "#{@request_client.get_url(request_options: request_options)}/container/list-of-objects"
          end
          parsed_json = JSON.parse(response.body)
          parsed_json&.map do |item|
            item = item.to_json
            SeedExhaustiveClient::Types::Object_::ObjectWithRequiredField.from_json(json_object: item)
          end
        end
      end

      # @param request [Set<String>]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [Set<String>]
      # @example
      #  exhaustive = SeedExhaustiveClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
      #  exhaustive.endpoints.container.get_and_return_set_of_primitives(request: Set["string"])
      def get_and_return_set_of_primitives(request:, request_options: nil)
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
            req.url "#{@request_client.get_url(request_options: request_options)}/container/set-of-primitives"
          end
          Set.new(response.body)
        end
      end

      # @param request [Set<SeedExhaustiveClient::Types::Object_::ObjectWithRequiredField>]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [Set<SeedExhaustiveClient::Types::Object_::ObjectWithRequiredField>]
      # @example
      #  exhaustive = SeedExhaustiveClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
      #  exhaustive.endpoints.container.get_and_return_set_of_objects(request: Set[{ string: "string" }])
      def get_and_return_set_of_objects(request:, request_options: nil)
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
            req.url "#{@request_client.get_url(request_options: request_options)}/container/set-of-objects"
          end
          Set.new(response.body)
        end
      end

      # @param request [Hash{String => String}]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [Hash{String => String}]
      # @example
      #  exhaustive = SeedExhaustiveClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
      #  exhaustive.endpoints.container.get_and_return_map_prim_to_prim(request: { "string": "string" })
      def get_and_return_map_prim_to_prim(request:, request_options: nil)
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
            req.url "#{@request_client.get_url(request_options: request_options)}/container/map-prim-to-prim"
          end
          parsed_json = JSON.parse(response.body)
          parsed_json
        end
      end

      # @param request [Hash{String => SeedExhaustiveClient::Types::Object_::ObjectWithRequiredField}]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [Hash{String => SeedExhaustiveClient::Types::Object_::ObjectWithRequiredField}]
      # @example
      #  exhaustive = SeedExhaustiveClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
      #  exhaustive.endpoints.container.get_and_return_map_of_prim_to_object(request: { "string": { string: "string" } })
      def get_and_return_map_of_prim_to_object(request:, request_options: nil)
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
            req.url "#{@request_client.get_url(request_options: request_options)}/container/map-prim-to-object"
          end
          parsed_json = JSON.parse(response.body)
          parsed_json&.transform_values do |value|
            value = value.to_json
            SeedExhaustiveClient::Types::Object_::ObjectWithRequiredField.from_json(json_object: value)
          end
        end
      end

      # @param request [Hash] Request of type SeedExhaustiveClient::Types::Object_::ObjectWithRequiredField, as a Hash
      #   * :string (String)
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [SeedExhaustiveClient::Types::Object_::ObjectWithRequiredField]
      # @example
      #  exhaustive = SeedExhaustiveClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
      #  exhaustive.endpoints.container.get_and_return_optional(request: { string: "string" })
      def get_and_return_optional(request: nil, request_options: nil)
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
            req.url "#{@request_client.get_url(request_options: request_options)}/container/opt-objects"
          end
          SeedExhaustiveClient::Types::Object_::ObjectWithRequiredField.from_json(json_object: response.body)
        end
      end
    end
  end
end
