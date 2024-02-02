# frozen_string_literal: true

require_relative "../../types/union/types/animal"
require "async"

module SeedExhaustiveClient
  module Endpoints
    module Union
      class UnionClient
        attr_reader :request_client

        # @param request_client [RequestClient]
        # @return [Endpoints::Union::UnionClient]
        def initialize(request_client:)
          # @type [RequestClient]
          @request_client = request_client
        end

        # @param request [Hash] Request of type Types::Union::Animal, as a Hash
        # @param request_options [RequestOptions]
        # @return [Types::Union::Animal]
        def get_and_return_union(request:, request_options: nil)
          response = @request_client.conn.post("/union") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
            req.body = { **request, **request_options&.additional_body_parameters }.compact
          end
          Types::Union::Animal.from_json(json_object: response)
        end
      end

      class AsyncUnionClient
        attr_reader :request_client

        # @param request_client [AsyncRequestClient]
        # @return [Endpoints::Union::AsyncUnionClient]
        def initialize(request_client:)
          # @type [AsyncRequestClient]
          @request_client = request_client
        end

        # @param request [Hash] Request of type Types::Union::Animal, as a Hash
        # @param request_options [RequestOptions]
        # @return [Types::Union::Animal]
        def get_and_return_union(request:, request_options: nil)
          Async.call do
            response = @request_client.conn.post("/union") do |req|
              req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
              req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
              req.headers = { **req.headers, **request_options&.additional_headers }.compact
              req.body = { **request, **request_options&.additional_body_parameters }.compact
            end
            Types::Union::Animal.from_json(json_object: response)
          end
        end
      end
    end
  end
end
