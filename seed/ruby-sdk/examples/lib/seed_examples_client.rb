# frozen_string_literal: true

require_relative "environment"
require_relative "types_export"
require_relative "requests"
require "faraday"
require "faraday/retry"
require_relative "seed_examples_client/fileclient"
require_relative "seed_examples_client/file/notificationclient"
require_relative "seed_examples_client/file/notification/service/client"
require_relative "seed_examples_client/file/service/client"
require_relative "seed_examples_client/healthclient"
require_relative "seed_examples_client/health/service/client"
require_relative "seed_examples_client/service/client"
require "async/http/faraday"

module SeedExamplesClient
  class Client
    attr_reader :file, :health, :service

    # @param environment [Environment]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [Client]
    def initialize(environment: nil, max_retries: nil, timeout_in_seconds: nil, token: nil)
      @request_client = RequestClient.new(environment: environment, max_retries: max_retries,
                                          timeout_in_seconds: timeout_in_seconds, token: token)
      @file = File::Client.new(request_client: @request_client)
      @health = Health::Client.new(request_client: @request_client)
      @service = ServiceClient.new(request_client: @request_client)
    end

    # @param request [String]
    # @param request_options [RequestOptions]
    # @return [String]
    def echo(request:, request_options: nil)
      response = @request_client.conn.post("/") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
      end
      response.body
    end
  end

  class AsyncClient
    attr_reader :file, :health, :service

    # @param environment [Environment]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [AsyncClient]
    def initialize(environment: nil, max_retries: nil, timeout_in_seconds: nil, token: nil)
      @async_request_client = AsyncRequestClient.new(environment: environment, max_retries: max_retries,
                                                     timeout_in_seconds: timeout_in_seconds, token: token)
      @file = File::AsyncClient.new(request_client: @async_request_client)
      @health = Health::AsyncClient.new(request_client: @async_request_client)
      @service = AsyncServiceClient.new(request_client: @async_request_client)
    end

    # @param request [String]
    # @param request_options [RequestOptions]
    # @return [String]
    def echo(request:, request_options: nil)
      response = @async_request_client.conn.post("/") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
      end
      response.body
    end
  end
end
