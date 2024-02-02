# frozen_string_literal: true

require "async"

module SeedExamplesClient
  module Health
    module Service
      class ServiceClient
        attr_reader :request_client

        # @param request_client [RequestClient]
        # @return [ServiceClient]
        def initialize(request_client:)
          # @type [RequestClient]
          @request_client = request_client
        end

        # @param id [String]
        # @param request_options [RequestOptions]
        # @return [Void]
        def check(id:, request_options: nil)
          @request_client.conn.get("/check/#{id}") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
          end
        end

        # @param request_options [RequestOptions]
        # @return [Boolean]
        def ping(request_options: nil)
          @request_client.conn.get("/ping") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
          end
        end
      end

      class AsyncServiceClient
        attr_reader :request_client

        # @param request_client [AsyncRequestClient]
        # @return [AsyncServiceClient]
        def initialize(request_client:)
          # @type [AsyncRequestClient]
          @request_client = request_client
        end

        # @param id [String]
        # @param request_options [RequestOptions]
        # @return [Void]
        def check(id:, request_options: nil)
          Async.call do
            @request_client.conn.get("/check/#{id}") do |req|
              req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
              req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
              req.headers = { **req.headers, **request_options&.additional_headers }.compact
            end
          end
        end

        # @param request_options [RequestOptions]
        # @return [Boolean]
        def ping(request_options: nil)
          Async.call do
            response = @request_client.conn.get("/ping") do |req|
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
