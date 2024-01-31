# frozen_string_literal: true

require_relative "types/optional_string"
require_relative "types/importing_type"
require "async"

module SeedAudiencesClient
  module Foo
    class FooClient
      attr_reader :request_client

      # @param request_client [RequestClient]
      # @return [FooClient]
      def initialize(request_client:)
        # @type [RequestClient]
        @request_client = request_client
      end

      # @param optional_string [Foo::OPTIONAL_STRING]
      # @param public_property [String]
      # @param private_property [Integer]
      # @param request_options [RequestOptions]
      # @return [Foo::ImportingType]
      def find(optional_string:, public_property: nil, private_property: nil, request_options: nil)
        response = @request_client.conn.post("/") do |req|
          req.headers = { **req.headers, **request_options&.additional_headers }.compact
          req.params = { **request_options&.additional_query_parameters, "optionalString": optional_string }.compact
          req.body = {
            **request_options&.additional_body_parameters,
            publicProperty: public_property,
            privateProperty: private_property
          }.compact
        end
        Foo::ImportingType.from_json(json_object: response)
      end
    end

    class AsyncFooClient
      attr_reader :request_client

      # @param request_client [AsyncRequestClient]
      # @return [AsyncFooClient]
      def initialize(request_client:)
        # @type [AsyncRequestClient]
        @request_client = request_client
      end

      # @param optional_string [Foo::OPTIONAL_STRING]
      # @param public_property [String]
      # @param private_property [Integer]
      # @param request_options [RequestOptions]
      # @return [Foo::ImportingType]
      def find(optional_string:, public_property: nil, private_property: nil, request_options: nil)
        Async.call do
          response = @request_client.conn.post("/") do |req|
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
            req.params = { **request_options&.additional_query_parameters, "optionalString": optional_string }.compact
            req.body = {
              **request_options&.additional_body_parameters,
              publicProperty: public_property,
              privateProperty: private_property
            }.compact
          end
          Foo::ImportingType.from_json(json_object: response)
        end
      end
    end
  end
end
