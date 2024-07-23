# frozen_string_literal: true

require_relative "../../requests"
require_relative "types/my_response"
require "async"

module SeedCodeSamplesClient
  class ServiceClient
    # @return [SeedCodeSamplesClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedCodeSamplesClient::RequestClient]
    # @return [SeedCodeSamplesClient::ServiceClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param num_events [Integer]
    # @param request_options [SeedCodeSamplesClient::RequestOptions]
    # @return [SeedCodeSamplesClient::Service::MyResponse]
    # @example
    #  code_samples = SeedCodeSamplesClient::Client.new(base_url: "https://api.example.com")
    #  code_samples.service.hello(num_events: 5)
    def hello(num_events:, request_options: nil)
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
        req.body = { **(request_options&.additional_body_parameters || {}), num_events: num_events }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/hello"
      end
      SeedCodeSamplesClient::Service::MyResponse.from_json(json_object: response.body)
    end
  end

  class AsyncServiceClient
    # @return [SeedCodeSamplesClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedCodeSamplesClient::AsyncRequestClient]
    # @return [SeedCodeSamplesClient::AsyncServiceClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param num_events [Integer]
    # @param request_options [SeedCodeSamplesClient::RequestOptions]
    # @return [SeedCodeSamplesClient::Service::MyResponse]
    # @example
    #  code_samples = SeedCodeSamplesClient::Client.new(base_url: "https://api.example.com")
    #  code_samples.service.hello(num_events: 5)
    def hello(num_events:, request_options: nil)
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
          req.body = { **(request_options&.additional_body_parameters || {}), num_events: num_events }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/hello"
        end
        SeedCodeSamplesClient::Service::MyResponse.from_json(json_object: response.body)
      end
    end
  end
end
