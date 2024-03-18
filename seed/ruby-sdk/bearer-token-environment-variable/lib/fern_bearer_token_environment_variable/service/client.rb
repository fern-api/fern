# frozen_string_literal: true

require_relative "../../requests"
require "async"

module SeedBearerTokenEnvironmentVariableClient
  class ServiceClient
    attr_reader :request_client

    # @param request_client [RequestClient]
    # @return [ServiceClient]
    def initialize(request_client:)
      # @type [RequestClient]
      @request_client = request_client
    end

    # GET request with custom api key
    #
    # @param request_options [RequestOptions]
    # @return [String]
    def get_with_bearer_token(request_options: nil)
      response = @request_client.conn.get("/apiKey") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.api_key unless request_options&.api_key.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
      end
      response.body
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

    # GET request with custom api key
    #
    # @param request_options [RequestOptions]
    # @return [String]
    def get_with_bearer_token(request_options: nil)
      Async do
        response = @request_client.conn.get("/apiKey") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.api_key unless request_options&.api_key.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        end
        response.body
      end
    end
  end
end
