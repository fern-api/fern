# frozen_string_literal: true

require_relative "../../../requests"
require "async"

module SeedApiClient
  module A
    module B
      class BClient
        attr_reader :request_client

        # @param request_client [RequestClient]
        # @return [A::B::BClient]
        def initialize(request_client:)
          # @type [RequestClient]
          @request_client = request_client
        end

        # @param request_options [RequestOptions]
        # @return [Void]
        def foo(request_options: nil)
          @request_client.conn.post("/") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          end
        end
      end

      class AsyncBClient
        attr_reader :request_client

        # @param request_client [AsyncRequestClient]
        # @return [A::B::AsyncBClient]
        def initialize(request_client:)
          # @type [AsyncRequestClient]
          @request_client = request_client
        end

        # @param request_options [RequestOptions]
        # @return [Void]
        def foo(request_options: nil)
          Async do
            @request_client.conn.post("/") do |req|
              req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
              req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            end
          end
        end
      end
    end
  end
end
