# frozen_string_literal: true

require_relative "../../requests"
require_relative "types/stream_response"
require "async"

module SeedStreamingClient
  class DummyClient
    # @return [SeedStreamingClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedStreamingClient::RequestClient]
    # @return [SeedStreamingClient::DummyClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param num_events [Integer]
    # @param request_options [SeedStreamingClient::RequestOptions]
    # @return [SeedStreamingClient::Dummy::StreamResponse]
    # @example
    #  streaming = SeedStreamingClient::Client.new(base_url: "https://api.example.com")
    #  streaming.dummy.generate(num_events: 5)
    def generate(num_events:, request_options: nil)
      response = @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        req.body = {
          **(request_options&.additional_body_parameters || {}),
          "stream": false,
          num_events: num_events
        }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/generate"
      end
      SeedStreamingClient::Dummy::StreamResponse.from_json(json_object: response.body)
    end
  end

  class AsyncDummyClient
    # @return [SeedStreamingClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedStreamingClient::AsyncRequestClient]
    # @return [SeedStreamingClient::AsyncDummyClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param num_events [Integer]
    # @param request_options [SeedStreamingClient::RequestOptions]
    # @return [SeedStreamingClient::Dummy::StreamResponse]
    # @example
    #  streaming = SeedStreamingClient::Client.new(base_url: "https://api.example.com")
    #  streaming.dummy.generate(num_events: 5)
    def generate(num_events:, request_options: nil)
      Async do
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          req.body = {
            **(request_options&.additional_body_parameters || {}),
            "stream": false,
            num_events: num_events
          }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/generate"
        end
        SeedStreamingClient::Dummy::StreamResponse.from_json(json_object: response.body)
      end
    end
  end
end
