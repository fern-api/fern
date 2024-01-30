# frozen_string_literal: true

require_relative "../../types/object/types/object_with_required_field"
require_relative "../../types/object/types/object_with_optional_field"
require "async"

module SeedExhaustiveClient
  module Endpoints
    module HttpMethods
      class HttpMethodsClient
        attr_reader :request_client

        # @param request_client [RequestClient]
        # @return [HttpMethodsClient]
        def initialize(request_client:)
          # @type [RequestClient]
          @request_client = request_client
        end

        # @param id [String]
        # @param request_options [RequestOptions]
        # @return [String]
        def test_get(id:, request_options: nil)
          @request_client.conn.get("/http-methods/#{id}") do |req|
            req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
          end
        end

        # @param request [Types::Object::ObjectWithRequiredField]
        # @param request_options [RequestOptions]
        # @return [Types::Object::ObjectWithOptionalField]
        def test_post(request:, request_options: nil)
          response = @request_client.conn.post("/http-methods") do |req|
            req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
            req.body = request
          end
          Types::Object::ObjectWithOptionalField.from_json(json_object: response)
        end

        # @param id [String]
        # @param request [Types::Object::ObjectWithRequiredField]
        # @param request_options [RequestOptions]
        # @return [Types::Object::ObjectWithOptionalField]
        def test_put(id:, request:, request_options: nil)
          response = @request_client.conn.put("/http-methods/#{id}") do |req|
            req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
            req.body = request
          end
          Types::Object::ObjectWithOptionalField.from_json(json_object: response)
        end

        # @param id [String]
        # @param request [Types::Object::ObjectWithOptionalField]
        # @param request_options [RequestOptions]
        # @return [Types::Object::ObjectWithOptionalField]
        def test_patch(id:, request:, request_options: nil)
          response = @request_client.conn.patch("/http-methods/#{id}") do |req|
            req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
            req.body = request
          end
          Types::Object::ObjectWithOptionalField.from_json(json_object: response)
        end

        # @param id [String]
        # @param request_options [RequestOptions]
        # @return [Boolean]
        def test_delete(id:, request_options: nil)
          @request_client.conn.delete("/http-methods/#{id}") do |req|
            req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
          end
        end
      end

      class AsyncHttpMethodsClient
        attr_reader :request_client

        # @param request_client [AsyncRequestClient]
        # @return [AsyncHttpMethodsClient]
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
              req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
            end
            response
          end
        end

        # @param request [Types::Object::ObjectWithRequiredField]
        # @param request_options [RequestOptions]
        # @return [Types::Object::ObjectWithOptionalField]
        def test_post(request:, request_options: nil)
          Async.call do
            response = @request_client.conn.post("/http-methods") do |req|
              req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
              req.body = request
            end
            Types::Object::ObjectWithOptionalField.from_json(json_object: response)
          end
        end

        # @param id [String]
        # @param request [Types::Object::ObjectWithRequiredField]
        # @param request_options [RequestOptions]
        # @return [Types::Object::ObjectWithOptionalField]
        def test_put(id:, request:, request_options: nil)
          Async.call do
            response = @request_client.conn.put("/http-methods/#{id}") do |req|
              req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
              req.body = request
            end
            Types::Object::ObjectWithOptionalField.from_json(json_object: response)
          end
        end

        # @param id [String]
        # @param request [Types::Object::ObjectWithOptionalField]
        # @param request_options [RequestOptions]
        # @return [Types::Object::ObjectWithOptionalField]
        def test_patch(id:, request:, request_options: nil)
          Async.call do
            response = @request_client.conn.patch("/http-methods/#{id}") do |req|
              req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
              req.body = request
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
              req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
            end
            response
          end
        end
      end
    end
  end
end
