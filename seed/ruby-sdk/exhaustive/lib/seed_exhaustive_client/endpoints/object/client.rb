# frozen_string_literal: true

require_relative "../../types/object/types/object_with_optional_field"
require_relative "../../types/object/types/object_with_required_field"
require_relative "../../types/object/types/object_with_map_of_map"
require_relative "../../types/object/types/nested_object_with_optional_field"
require_relative "../../types/object/types/nested_object_with_required_field"
require "async"

module SeedExhaustiveClient
  module Endpoints
    module Object
      class ObjectClient
        attr_reader :request_client

        # @param request_client [RequestClient]
        # @return [ObjectClient]
        def initialize(request_client:)
          # @type [RequestClient]
          @request_client = request_client
        end

        # @param request [Types::Object::ObjectWithOptionalField]
        # @param request_options [RequestOptions]
        # @return [Types::Object::ObjectWithOptionalField]
        def get_and_return_with_optional_field(request:, request_options: nil)
          response = @request_client.conn.post("/object/get-and-return-with-optional-field") do |req|
            req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
            req.body = request
          end
          Types::Object::ObjectWithOptionalField.from_json(json_object: response)
        end

        # @param request [Types::Object::ObjectWithRequiredField]
        # @param request_options [RequestOptions]
        # @return [Types::Object::ObjectWithRequiredField]
        def get_and_return_with_required_field(request:, request_options: nil)
          response = @request_client.conn.post("/object/get-and-return-with-required-field") do |req|
            req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
            req.body = request
          end
          Types::Object::ObjectWithRequiredField.from_json(json_object: response)
        end

        # @param request [Types::Object::ObjectWithMapOfMap]
        # @param request_options [RequestOptions]
        # @return [Types::Object::ObjectWithMapOfMap]
        def get_and_return_with_map_of_map(request:, request_options: nil)
          response = @request_client.conn.post("/object/get-and-return-with-map-of-map") do |req|
            req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
            req.body = request
          end
          Types::Object::ObjectWithMapOfMap.from_json(json_object: response)
        end

        # @param request [Types::Object::NestedObjectWithOptionalField]
        # @param request_options [RequestOptions]
        # @return [Types::Object::NestedObjectWithOptionalField]
        def get_and_return_nested_with_optional_field(request:, request_options: nil)
          response = @request_client.conn.post("/object/get-and-return-nested-with-optional-field") do |req|
            req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
            req.body = request
          end
          Types::Object::NestedObjectWithOptionalField.from_json(json_object: response)
        end

        # @param request [Types::Object::NestedObjectWithRequiredField]
        # @param request_options [RequestOptions]
        # @return [Types::Object::NestedObjectWithRequiredField]
        def get_and_return_nested_with_required_field(request:, request_options: nil)
          response = @request_client.conn.post("/object/get-and-return-nested-with-required-field") do |req|
            req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
            req.body = request
          end
          Types::Object::NestedObjectWithRequiredField.from_json(json_object: response)
        end
      end

      class AsyncObjectClient
        attr_reader :request_client

        # @param request_client [AsyncRequestClient]
        # @return [AsyncObjectClient]
        def initialize(request_client:)
          # @type [AsyncRequestClient]
          @request_client = request_client
        end

        # @param request [Types::Object::ObjectWithOptionalField]
        # @param request_options [RequestOptions]
        # @return [Types::Object::ObjectWithOptionalField]
        def get_and_return_with_optional_field(request:, request_options: nil)
          Async.call do
            response = @request_client.conn.post("/object/get-and-return-with-optional-field") do |req|
              req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
              req.body = request
            end
            Types::Object::ObjectWithOptionalField.from_json(json_object: response)
          end
        end

        # @param request [Types::Object::ObjectWithRequiredField]
        # @param request_options [RequestOptions]
        # @return [Types::Object::ObjectWithRequiredField]
        def get_and_return_with_required_field(request:, request_options: nil)
          Async.call do
            response = @request_client.conn.post("/object/get-and-return-with-required-field") do |req|
              req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
              req.body = request
            end
            Types::Object::ObjectWithRequiredField.from_json(json_object: response)
          end
        end

        # @param request [Types::Object::ObjectWithMapOfMap]
        # @param request_options [RequestOptions]
        # @return [Types::Object::ObjectWithMapOfMap]
        def get_and_return_with_map_of_map(request:, request_options: nil)
          Async.call do
            response = @request_client.conn.post("/object/get-and-return-with-map-of-map") do |req|
              req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
              req.body = request
            end
            Types::Object::ObjectWithMapOfMap.from_json(json_object: response)
          end
        end

        # @param request [Types::Object::NestedObjectWithOptionalField]
        # @param request_options [RequestOptions]
        # @return [Types::Object::NestedObjectWithOptionalField]
        def get_and_return_nested_with_optional_field(request:, request_options: nil)
          Async.call do
            response = @request_client.conn.post("/object/get-and-return-nested-with-optional-field") do |req|
              req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
              req.body = request
            end
            Types::Object::NestedObjectWithOptionalField.from_json(json_object: response)
          end
        end

        # @param request [Types::Object::NestedObjectWithRequiredField]
        # @param request_options [RequestOptions]
        # @return [Types::Object::NestedObjectWithRequiredField]
        def get_and_return_nested_with_required_field(request:, request_options: nil)
          Async.call do
            response = @request_client.conn.post("/object/get-and-return-nested-with-required-field") do |req|
              req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
              req.body = request
            end
            Types::Object::NestedObjectWithRequiredField.from_json(json_object: response)
          end
        end
      end
    end
  end
end
