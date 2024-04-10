# frozen_string_literal: true

require_relative "../../requests"
require "async"

module SeedPlainTextClient
  class ServiceClient
    attr_reader :request_client

    # @param request_client [SeedPlainTextClient::RequestClient]
    # @return [SeedPlainTextClient::ServiceClient]
    def initialize(request_client:)
      # @type [SeedPlainTextClient::RequestClient]
      @request_client = request_client
    end

    # @param request_options [SeedPlainTextClient::RequestOptions]
    # @return [String]
    def get_text(request_options: nil)
      response = @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/text"
      end
      response.body
    end
  end

  class AsyncServiceClient
    attr_reader :request_client

    # @param request_client [SeedPlainTextClient::AsyncRequestClient]
    # @return [SeedPlainTextClient::AsyncServiceClient]
    def initialize(request_client:)
      # @type [SeedPlainTextClient::AsyncRequestClient]
      @request_client = request_client
    end

    # @param request_options [SeedPlainTextClient::RequestOptions]
    # @return [String]
    def get_text(request_options: nil)
      Async do
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/text"
        end
        response.body
      end
    end
  end
end
