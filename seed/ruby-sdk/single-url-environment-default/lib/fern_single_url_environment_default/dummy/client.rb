# frozen_string_literal: true

require_relative "../../requests"
require "async"

module SeedSingleUrlEnvironmentDefaultClient
  class DummyClient
    attr_reader :request_client

    # @param request_client [RequestClient]
    # @return [DummyClient]
    def initialize(request_client:)
      # @type [RequestClient]
      @request_client = request_client
    end

    # @param request_options [RequestOptions]
    # @return [String]
    def get_dummy(request_options: nil)
      response = @request_client.conn.get("/dummy") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
      end
      response.body
    end
  end

  class AsyncDummyClient
    attr_reader :request_client

    # @param request_client [AsyncRequestClient]
    # @return [AsyncDummyClient]
    def initialize(request_client:)
      # @type [AsyncRequestClient]
      @request_client = request_client
    end

    # @param request_options [RequestOptions]
    # @return [String]
    def get_dummy(request_options: nil)
      Async do
        response = @request_client.conn.get("/dummy") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        end
        response.body
      end
    end
  end
end
