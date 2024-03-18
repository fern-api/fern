# frozen_string_literal: true

require_relative "../../requests"
require_relative "types/my_response"
require "async"

module SeedCodeSamplesClient
  class ServiceClient
    attr_reader :request_client

    # @param request_client [RequestClient]
    # @return [ServiceClient]
    def initialize(request_client:)
      # @type [RequestClient]
      @request_client = request_client
    end

    # @param num_events [Integer]
    # @param request_options [RequestOptions]
    # @return [Service::MyResponse]
    def hello(num_events:, request_options: nil)
      response = @request_client.conn.post("/hello") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.body = { **(request_options&.additional_body_parameters || {}), num_events: num_events }.compact
      end
      Service::MyResponse.from_json(json_object: response.body)
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

    # @param num_events [Integer]
    # @param request_options [RequestOptions]
    # @return [Service::MyResponse]
    def hello(num_events:, request_options: nil)
      Async do
        response = @request_client.conn.post("/hello") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request_options&.additional_body_parameters || {}), num_events: num_events }.compact
        end
        Service::MyResponse.from_json(json_object: response.body)
      end
    end
  end
end
