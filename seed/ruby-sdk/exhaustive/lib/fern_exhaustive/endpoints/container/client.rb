# frozen_string_literal: true

require_relative "../../../requests"
require_relative "../../types/object/types/object_with_required_field"
require "set"
require "async"

module SeedExhaustiveClient
  module Endpoints
    class ContainerClient
      attr_reader :request_client

      # @param request_client [RequestClient]
      # @return [Endpoints::ContainerClient]
      def initialize(request_client:)
        # @type [RequestClient]
        @request_client = request_client
      end

      # @param request [Array<String>]
      # @param request_options [RequestOptions]
      # @return [Array<String>]
      def get_and_return_list_of_primitives(request:, request_options: nil)
        response = @request_client.conn.post("/container/list-of-primitives") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        end
        response.body
      end

      # @param request [Array<Hash>] Request of type Array<Types::Object::ObjectWithRequiredField>, as a Hash
      #   * :string (String)
      # @param request_options [RequestOptions]
      # @return [Array<Types::Object::ObjectWithRequiredField>]
      def get_and_return_list_of_objects(request:, request_options: nil)
        response = @request_client.conn.post("/container/list-of-objects") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        end
        return if response.body.nil?

        response.body.map do |v|
          v = v.to_json
          Types::Object::ObjectWithRequiredField.from_json(json_object: v)
        end
      end

      # @param request [Set<String>]
      # @param request_options [RequestOptions]
      # @return [Set<String>]
      def get_and_return_set_of_primitives(request:, request_options: nil)
        response = @request_client.conn.post("/container/set-of-primitives") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        end
        Set.new(response.body)
      end

      # @param request [Set<Types::Object::ObjectWithRequiredField>]
      # @param request_options [RequestOptions]
      # @return [Set<Types::Object::ObjectWithRequiredField>]
      def get_and_return_set_of_objects(request:, request_options: nil)
        response = @request_client.conn.post("/container/set-of-objects") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        end
        Set.new(response.body)
      end

      # @param request [Hash{String => String}]
      # @param request_options [RequestOptions]
      # @return [Hash{String => String}]
      def get_and_return_map_prim_to_prim(request:, request_options: nil)
        response = @request_client.conn.post("/container/map-prim-to-prim") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        end
        response.body
      end

      # @param request [Hash{String => Types::Object::ObjectWithRequiredField}]
      # @param request_options [RequestOptions]
      # @return [Hash{String => Types::Object::ObjectWithRequiredField}]
      def get_and_return_map_of_prim_to_object(request:, request_options: nil)
        response = @request_client.conn.post("/container/map-prim-to-object") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        end
        return if response.body.nil?

        response.body.transform_values do |_k, v|
          v = v.to_json
          Types::Object::ObjectWithRequiredField.from_json(json_object: v)
        end
      end

      # @param request [Hash] Request of type Types::Object::ObjectWithRequiredField, as a Hash
      #   * :string (String)
      # @param request_options [RequestOptions]
      # @return [Types::Object::ObjectWithRequiredField]
      def get_and_return_optional(request: nil, request_options: nil)
        response = @request_client.conn.post("/container/opt-objects") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        end
        Types::Object::ObjectWithRequiredField.from_json(json_object: response.body)
      end
    end

    class AsyncContainerClient
      attr_reader :request_client

      # @param request_client [AsyncRequestClient]
      # @return [Endpoints::AsyncContainerClient]
      def initialize(request_client:)
        # @type [AsyncRequestClient]
        @request_client = request_client
      end

      # @param request [Array<String>]
      # @param request_options [RequestOptions]
      # @return [Array<String>]
      def get_and_return_list_of_primitives(request:, request_options: nil)
        Async do
          response = @request_client.conn.post("/container/list-of-primitives") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          end
          response.body
        end
      end

      # @param request [Array<Hash>] Request of type Array<Types::Object::ObjectWithRequiredField>, as a Hash
      #   * :string (String)
      # @param request_options [RequestOptions]
      # @return [Array<Types::Object::ObjectWithRequiredField>]
      def get_and_return_list_of_objects(request:, request_options: nil)
        Async do
          response = @request_client.conn.post("/container/list-of-objects") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          end
          response.body&.map do |v|
            v = v.to_json
            Types::Object::ObjectWithRequiredField.from_json(json_object: v)
          end
        end
      end

      # @param request [Set<String>]
      # @param request_options [RequestOptions]
      # @return [Set<String>]
      def get_and_return_set_of_primitives(request:, request_options: nil)
        Async do
          response = @request_client.conn.post("/container/set-of-primitives") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          end
          Set.new(response.body)
        end
      end

      # @param request [Set<Types::Object::ObjectWithRequiredField>]
      # @param request_options [RequestOptions]
      # @return [Set<Types::Object::ObjectWithRequiredField>]
      def get_and_return_set_of_objects(request:, request_options: nil)
        Async do
          response = @request_client.conn.post("/container/set-of-objects") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          end
          Set.new(response.body)
        end
      end

      # @param request [Hash{String => String}]
      # @param request_options [RequestOptions]
      # @return [Hash{String => String}]
      def get_and_return_map_prim_to_prim(request:, request_options: nil)
        Async do
          response = @request_client.conn.post("/container/map-prim-to-prim") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          end
          response.body
        end
      end

      # @param request [Hash{String => Types::Object::ObjectWithRequiredField}]
      # @param request_options [RequestOptions]
      # @return [Hash{String => Types::Object::ObjectWithRequiredField}]
      def get_and_return_map_of_prim_to_object(request:, request_options: nil)
        Async do
          response = @request_client.conn.post("/container/map-prim-to-object") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          end
          response.body&.transform_values do |_k, v|
            v = v.to_json
            Types::Object::ObjectWithRequiredField.from_json(json_object: v)
          end
        end
      end

      # @param request [Hash] Request of type Types::Object::ObjectWithRequiredField, as a Hash
      #   * :string (String)
      # @param request_options [RequestOptions]
      # @return [Types::Object::ObjectWithRequiredField]
      def get_and_return_optional(request: nil, request_options: nil)
        Async do
          response = @request_client.conn.post("/container/opt-objects") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          end
          Types::Object::ObjectWithRequiredField.from_json(json_object: response.body)
        end
      end
    end
  end
end
