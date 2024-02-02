# frozen_string_literal: true

require "async"

module SeedApiClient
  module Folder
    module Service
      class ServiceClient
        attr_reader :request_client

        # @param request_client [RequestClient]
        # @return [Folder::Service::ServiceClient]
        def initialize(request_client:)
          # @type [RequestClient]
          @request_client = request_client
        end

        # @param request_options [RequestOptions]
        # @return [Void]
        def endpoint(request_options: nil)
          @request_client.conn.get("/service") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
          end
        end

        # @param request [Object]
        # @param request_options [RequestOptions]
        # @return [Void]
        def unknown_request(request:, request_options: nil)
          @request_client.conn.post("/service") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
            req.body = { **request, **request_options&.additional_body_parameters }.compact
          end
        end
      end

      class AsyncServiceClient
        attr_reader :request_client

        # @param request_client [AsyncRequestClient]
        # @return [Folder::Service::AsyncServiceClient]
        def initialize(request_client:)
          # @type [AsyncRequestClient]
          @request_client = request_client
        end

        # @param request_options [RequestOptions]
        # @return [Void]
        def endpoint(request_options: nil)
          Async.call do
            @request_client.conn.get("/service") do |req|
              req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
              req.headers = { **req.headers, **request_options&.additional_headers }.compact
            end
          end
        end

        # @param request [Object]
        # @param request_options [RequestOptions]
        # @return [Void]
        def unknown_request(request:, request_options: nil)
          Async.call do
            @request_client.conn.post("/service") do |req|
              req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
              req.headers = { **req.headers, **request_options&.additional_headers }.compact
              req.body = { **request, **request_options&.additional_body_parameters }.compact
            end
          end
        end
      end
    end
  end
end
