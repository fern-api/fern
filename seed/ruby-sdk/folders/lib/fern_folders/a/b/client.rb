# frozen_string_literal: true

require_relative "../../../requests"
require "async"

module SeedApiClient
  module A
    module B
      class BClient
        attr_reader :request_client

        # @param request_client [SeedApiClient::RequestClient]
        # @return [SeedApiClient::A::B::BClient]
        def initialize(request_client:)
          # @type [SeedApiClient::RequestClient]
          @request_client = request_client
        end

        # @param request_options [SeedApiClient::RequestOptions]
        # @return [Void]
        def foo(request_options: nil)
          @request_client.conn.post do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.url "#{@request_client.get_url(request_options: request_options)}/"
          end
        end
      end

      class AsyncBClient
        attr_reader :request_client

        # @param request_client [SeedApiClient::AsyncRequestClient]
        # @return [SeedApiClient::A::B::AsyncBClient]
        def initialize(request_client:)
          # @type [SeedApiClient::AsyncRequestClient]
          @request_client = request_client
        end

        # @param request_options [SeedApiClient::RequestOptions]
        # @return [Void]
        def foo(request_options: nil)
          Async do
            @request_client.conn.post do |req|
              req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
              req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
              req.url "#{@request_client.get_url(request_options: request_options)}/"
            end
          end
        end
      end
    end
  end
end
