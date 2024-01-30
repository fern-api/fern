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
            req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
          end
        end

        # @param request_options [RequestOptions]
        # @return [Boolean]
        def ping(request_options: nil)
          @request_client.conn.get("/ping") do |req|
            req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
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
              req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
            end
          end
        end

        # @param request_options [RequestOptions]
        # @return [Boolean]
        def ping(request_options: nil)
          Async.call do
            response = @request_client.conn.get("/ping") do |req|
              req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
            end
            response
          end
        end
      end
    end
  end
end
