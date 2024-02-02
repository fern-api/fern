# frozen_string_literal: true

require_relative "types/importing_type"

require_relative "types/optional_string"
require "async"

module SeedAudiencesClient
  module Foo
    class FooClient
      attr_reader :request_client

      # @param request_client [RequestClient]
      # @return [Foo::FooClient]
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
          req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
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
      # @return [Foo::AsyncFooClient]
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
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
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
