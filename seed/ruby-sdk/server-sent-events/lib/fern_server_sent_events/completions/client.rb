# frozen_string_literal: true

require_relative "../../requests"
require "async"

module SeedServerSentEventsClient
  class CompletionsClient
    # @return [SeedServerSentEventsClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedServerSentEventsClient::RequestClient]
    # @return [SeedServerSentEventsClient::CompletionsClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param query [String]
    # @param request_options [SeedServerSentEventsClient::RequestOptions]
    # @return [Void]
    def stream(query:, request_options: nil)
      @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.body = { **(request_options&.additional_body_parameters || {}), query: query }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/stream"
      end
    end
  end

  class AsyncCompletionsClient
    # @return [SeedServerSentEventsClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedServerSentEventsClient::AsyncRequestClient]
    # @return [SeedServerSentEventsClient::AsyncCompletionsClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param query [String]
    # @param request_options [SeedServerSentEventsClient::RequestOptions]
    # @return [Void]
    def stream(query:, request_options: nil)
      Async do
        @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request_options&.additional_body_parameters || {}), query: query }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/stream"
        end
      end
    end
  end
end
