# frozen_string_literal: true

require_relative "environment"
require "faraday"
require "faraday/retry"
require "async/http/faraday"

module SeedExamplesClient
  class RequestClient
    # @return [Faraday]
    attr_reader :conn
    # @return [String]
    attr_reader :base_url
    # @return [String]
    attr_reader :token
    # @return [String]
    attr_reader :default_environment

    # @param base_url [String]
    # @param environment [SeedExamplesClient::Environment]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [SeedExamplesClient::RequestClient]
    def initialize(token:, base_url: nil, environment: nil, max_retries: nil, timeout_in_seconds: nil)
      @default_environment = environment
      @base_url = environment || base_url
      @token = "Bearer #{token}"
      @conn = Faraday.new do |faraday|
        faraday.request :json
        faraday.response :raise_error, include_request: true
        faraday.request :retry, { max: max_retries } unless max_retries.nil?
        faraday.options.timeout = timeout_in_seconds unless timeout_in_seconds.nil?
      end
    end

    # @param request_options [SeedExamplesClient::RequestOptions]
    # @return [String]
    def get_url(request_options: nil)
      request_options&.base_url || @default_environment || @base_url
    end

    # @return [Hash{String => String}]
    def get_headers
      headers = { "X-Fern-Language": "Ruby", "X-Fern-SDK-Name": "fern_examples", "X-Fern-SDK-Version": "0.0.1" }
      headers["Authorization"] = (@token.is_a?(Method) ? @token.call : @token) unless @token.nil?
      headers
    end
  end

  class AsyncRequestClient
    # @return [Faraday]
    attr_reader :conn
    # @return [String]
    attr_reader :base_url
    # @return [String]
    attr_reader :token
    # @return [String]
    attr_reader :default_environment

    # @param base_url [String]
    # @param environment [SeedExamplesClient::Environment]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [SeedExamplesClient::AsyncRequestClient]
    def initialize(token:, base_url: nil, environment: nil, max_retries: nil, timeout_in_seconds: nil)
      @default_environment = environment
      @base_url = environment || base_url
      @token = "Bearer #{token}"
      @conn = Faraday.new do |faraday|
        faraday.request :json
        faraday.response :raise_error, include_request: true
        faraday.adapter :async_http
        faraday.request :retry, { max: max_retries } unless max_retries.nil?
        faraday.options.timeout = timeout_in_seconds unless timeout_in_seconds.nil?
      end
    end

    # @param request_options [SeedExamplesClient::RequestOptions]
    # @return [String]
    def get_url(request_options: nil)
      request_options&.base_url || @default_environment || @base_url
    end

    # @return [Hash{String => String}]
    def get_headers
      headers = { "X-Fern-Language": "Ruby", "X-Fern-SDK-Name": "fern_examples", "X-Fern-SDK-Version": "0.0.1" }
      headers["Authorization"] = (@token.is_a?(Method) ? @token.call : @token) unless @token.nil?
      headers
    end
  end

  # Additional options for request-specific configuration when calling APIs via the
  #  SDK.
  class RequestOptions
    # @return [String]
    attr_reader :base_url
    # @return [String]
    attr_reader :token
    # @return [Hash{String => Object}]
    attr_reader :additional_headers
    # @return [Hash{String => Object}]
    attr_reader :additional_query_parameters
    # @return [Hash{String => Object}]
    attr_reader :additional_body_parameters
    # @return [Long]
    attr_reader :timeout_in_seconds

    # @param base_url [String]
    # @param token [String]
    # @param additional_headers [Hash{String => Object}]
    # @param additional_query_parameters [Hash{String => Object}]
    # @param additional_body_parameters [Hash{String => Object}]
    # @param timeout_in_seconds [Long]
    # @return [SeedExamplesClient::RequestOptions]
    def initialize(base_url: nil, token: nil, additional_headers: nil, additional_query_parameters: nil,
                   additional_body_parameters: nil, timeout_in_seconds: nil)
      @base_url = base_url
      @token = token
      @additional_headers = additional_headers
      @additional_query_parameters = additional_query_parameters
      @additional_body_parameters = additional_body_parameters
      @timeout_in_seconds = timeout_in_seconds
    end
  end

  # Additional options for request-specific configuration when calling APIs via the
  #  SDK.
  class IdempotencyRequestOptions
    # @return [String]
    attr_reader :base_url
    # @return [String]
    attr_reader :token
    # @return [Hash{String => Object}]
    attr_reader :additional_headers
    # @return [Hash{String => Object}]
    attr_reader :additional_query_parameters
    # @return [Hash{String => Object}]
    attr_reader :additional_body_parameters
    # @return [Long]
    attr_reader :timeout_in_seconds

    # @param base_url [String]
    # @param token [String]
    # @param additional_headers [Hash{String => Object}]
    # @param additional_query_parameters [Hash{String => Object}]
    # @param additional_body_parameters [Hash{String => Object}]
    # @param timeout_in_seconds [Long]
    # @return [SeedExamplesClient::IdempotencyRequestOptions]
    def initialize(base_url: nil, token: nil, additional_headers: nil, additional_query_parameters: nil,
                   additional_body_parameters: nil, timeout_in_seconds: nil)
      @base_url = base_url
      @token = token
      @additional_headers = additional_headers
      @additional_query_parameters = additional_query_parameters
      @additional_body_parameters = additional_body_parameters
      @timeout_in_seconds = timeout_in_seconds
    end
  end
end
