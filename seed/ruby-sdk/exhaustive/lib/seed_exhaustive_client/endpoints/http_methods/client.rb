# frozen_string_literal: true

require_relative "../../types/object/types/object_with_optional_field"

require_relative "../../types/object/types/object_with_required_field"
require "async"

module SeedExhaustiveClient
  module Endpoints
    module HttpMethods
      class HttpMethodsClient
        attr_reader :request_client

        # @param request_client [RequestClient]
        # @return [Endpoints::HttpMethods::HttpMethodsClient]
        def initialize(request_client:)
          # @type [RequestClient]
          @request_client = request_client
        end

        # @param id [String]
        # @param request_options [RequestOptions]
        # @return [String]
        def test_get(id:, request_options: nil)
          @request_client.conn.get("/http-methods/#{id}") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
          end
        end

        # @param request [Hash] Request of type Types::Object::ObjectWithRequiredField, as a Hash
        #   * :string (String)
        # @param request_options [RequestOptions]
        # @return [Types::Object::ObjectWithOptionalField]
        def test_post(request:, request_options: nil)
          response = @request_client.conn.post("/http-methods") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
            req.body = { **request, **request_options&.additional_body_parameters }.compact
          end
          Types::Object::ObjectWithOptionalField.from_json(json_object: response)
        end

        # @param id [String]
        # @param request [Hash] Request of type Types::Object::ObjectWithRequiredField, as a Hash
        #   * :string (String)
        # @param request_options [RequestOptions]
        # @return [Types::Object::ObjectWithOptionalField]
        def test_put(id:, request:, request_options: nil)
          response = @request_client.conn.put("/http-methods/#{id}") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
            req.body = { **request, **request_options&.additional_body_parameters }.compact
          end
          Types::Object::ObjectWithOptionalField.from_json(json_object: response)
        end

        # @param id [String]
        # @param request [Hash] Request of type Types::Object::ObjectWithOptionalField, as a Hash
        #   * :string (String)
        #   * :integer (Integer)
        #   * :long (Long)
        #   * :double (Float)
        #   * :bool (Boolean)
        #   * :datetime (DateTime)
        #   * :date (Date)
        #   * :uuid (UUID)
        #   * :base_64 (String)
        #   * :list (Array<String>)
        #   * :set (Set<String>)
        #   * :map (Hash{Integer => Integer})
        # @param request_options [RequestOptions]
        # @return [Types::Object::ObjectWithOptionalField]
        def test_patch(id:, request:, request_options: nil)
          response = @request_client.conn.patch("/http-methods/#{id}") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
            req.body = { **request, **request_options&.additional_body_parameters }.compact
          end
          Types::Object::ObjectWithOptionalField.from_json(json_object: response)
        end

        # @param id [String]
        # @param request_options [RequestOptions]
        # @return [Boolean]
        def test_delete(id:, request_options: nil)
          @request_client.conn.delete("/http-methods/#{id}") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
          end
        end
      end

      class AsyncHttpMethodsClient
        attr_reader :request_client

        # @param request_client [AsyncRequestClient]
        # @return [Endpoints::HttpMethods::AsyncHttpMethodsClient]
        def initialize(request_client:)
          # @type [AsyncRequestClient]
          @request_client = request_client
        end

        # @param id [String]
        # @param request_options [RequestOptions]
        # @return [String]
        def test_get(id:, request_options: nil)
          Async.call do
            response = @request_client.conn.get("/http-methods/#{id}") do |req|
              req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
              req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
              req.headers = { **req.headers, **request_options&.additional_headers }.compact
            end
            response
          end
        end

        # @param request [Hash] Request of type Types::Object::ObjectWithRequiredField, as a Hash
        #   * :string (String)
        # @param request_options [RequestOptions]
        # @return [Types::Object::ObjectWithOptionalField]
        def test_post(request:, request_options: nil)
          Async.call do
            response = @request_client.conn.post("/http-methods") do |req|
              req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
              req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
              req.headers = { **req.headers, **request_options&.additional_headers }.compact
              req.body = { **request, **request_options&.additional_body_parameters }.compact
            end
            Types::Object::ObjectWithOptionalField.from_json(json_object: response)
          end
        end

        # @param id [String]
        # @param request [Hash] Request of type Types::Object::ObjectWithRequiredField, as a Hash
        #   * :string (String)
        # @param request_options [RequestOptions]
        # @return [Types::Object::ObjectWithOptionalField]
        def test_put(id:, request:, request_options: nil)
          Async.call do
            response = @request_client.conn.put("/http-methods/#{id}") do |req|
              req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
              req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
              req.headers = { **req.headers, **request_options&.additional_headers }.compact
              req.body = { **request, **request_options&.additional_body_parameters }.compact
            end
            Types::Object::ObjectWithOptionalField.from_json(json_object: response)
          end
        end

        # @param id [String]
        # @param request [Hash] Request of type Types::Object::ObjectWithOptionalField, as a Hash
        #   * :string (String)
        #   * :integer (Integer)
        #   * :long (Long)
        #   * :double (Float)
        #   * :bool (Boolean)
        #   * :datetime (DateTime)
        #   * :date (Date)
        #   * :uuid (UUID)
        #   * :base_64 (String)
        #   * :list (Array<String>)
        #   * :set (Set<String>)
        #   * :map (Hash{Integer => Integer})
        # @param request_options [RequestOptions]
        # @return [Types::Object::ObjectWithOptionalField]
        def test_patch(id:, request:, request_options: nil)
          Async.call do
            response = @request_client.conn.patch("/http-methods/#{id}") do |req|
              req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
              req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
              req.headers = { **req.headers, **request_options&.additional_headers }.compact
              req.body = { **request, **request_options&.additional_body_parameters }.compact
            end
            Types::Object::ObjectWithOptionalField.from_json(json_object: response)
          end
        end

        # @param id [String]
        # @param request_options [RequestOptions]
        # @return [Boolean]
        def test_delete(id:, request_options: nil)
          Async.call do
            response = @request_client.conn.delete("/http-methods/#{id}") do |req|
              req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
              req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
              req.headers = { **req.headers, **request_options&.additional_headers }.compact
            end
            response
          end
        end
      end
    end
  end
end
