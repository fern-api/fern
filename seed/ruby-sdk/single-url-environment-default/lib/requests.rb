# frozen_string_literal: true

require "faraday"
require "faraday/retry"
require "async/http/faraday"

module SeedSingleUrlEnvironmentDefaultClient
  class RequestClient
    attr_reader :headers, :default_environment, :conn, :base_url

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [SeedSingleUrlEnvironmentDefaultClient::RequestClient]
    def initialize(token:, base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @default_environment = environment
      @base_url = environment || base_url
      @headers = {
        "X-Fern-Language": "Ruby",
        "X-Fern-SDK-Name": "fern_single_url_environment_default",
        "X-Fern-SDK-Version": "0.0.1",
        "Authorization": "Bearer #{token}"
      }
      @conn = Faraday.new(headers: @headers) do |faraday|
        faraday.request :json
        faraday.response :raise_error, include_request: true
        faraday.request :retry, { max: max_retries } unless max_retries.nil?
        faraday.options.timeout = timeout_in_seconds unless timeout_in_seconds.nil?
      end
    end

    # @param request_options [SeedSingleUrlEnvironmentDefaultClient::RequestOptions]
    # @param environment [String]
    # @return [String]
    def get_url(request_options:, environment:)
      request_options&.base_url || environment || @base_url
    end
  end

  class AsyncRequestClient
    attr_reader :headers, :default_environment, :conn, :base_url

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [SeedSingleUrlEnvironmentDefaultClient::AsyncRequestClient]
    def initialize(token:, base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @default_environment = environment
      @base_url = environment || base_url
      @headers = {
        "X-Fern-Language": "Ruby",
        "X-Fern-SDK-Name": "fern_single_url_environment_default",
        "X-Fern-SDK-Version": "0.0.1",
        "Authorization": "Bearer #{token}"
      }
      @conn = Faraday.new(headers: @headers) do |faraday|
        faraday.request :json
        faraday.response :raise_error, include_request: true
        faraday.adapter :async_http
        faraday.request :retry, { max: max_retries } unless max_retries.nil?
        faraday.options.timeout = timeout_in_seconds unless timeout_in_seconds.nil?
      end
    end

    # @param request_options [SeedSingleUrlEnvironmentDefaultClient::RequestOptions]
    # @param environment [String]
    # @return [String]
    def get_url(request_options:, environment:)
      request_options&.base_url || environment || @base_url
    end
  end

  # Additional options for request-specific configuration when calling APIs via the SDK.
  class RequestOptions
    attr_reader :base_url, :token, :additional_headers, :additional_query_parameters, :additional_body_parameters,
                :timeout_in_seconds

    # @param base_url [String]
    # @param token [String]
    # @param additional_headers [Hash{String => Object}]
    # @param additional_query_parameters [Hash{String => Object}]
    # @param additional_body_parameters [Hash{String => Object}]
    # @param timeout_in_seconds [Long]
    # @return [SeedSingleUrlEnvironmentDefaultClient::RequestOptions]
    def initialize(base_url: nil, token: nil, additional_headers: nil, additional_query_parameters: nil,
                   additional_body_parameters: nil, timeout_in_seconds: nil)
      # @type [String]
      @base_url = base_url
      # @type [String]
      @token = token
      # @type [Hash{String => Object}]
      @additional_headers = additional_headers
      # @type [Hash{String => Object}]
      @additional_query_parameters = additional_query_parameters
      # @type [Hash{String => Object}]
      @additional_body_parameters = additional_body_parameters
      # @type [Long]
      @timeout_in_seconds = timeout_in_seconds
    end
  end

  # Additional options for request-specific configuration when calling APIs via the SDK.
  class IdempotencyRequestOptions
    attr_reader :base_url, :token, :additional_headers, :additional_query_parameters, :additional_body_parameters,
                :timeout_in_seconds

    # @param base_url [String]
    # @param token [String]
    # @param additional_headers [Hash{String => Object}]
    # @param additional_query_parameters [Hash{String => Object}]
    # @param additional_body_parameters [Hash{String => Object}]
    # @param timeout_in_seconds [Long]
    # @return [SeedSingleUrlEnvironmentDefaultClient::IdempotencyRequestOptions]
    def initialize(base_url: nil, token: nil, additional_headers: nil, additional_query_parameters: nil,
                   additional_body_parameters: nil, timeout_in_seconds: nil)
      # @type [String]
      @base_url = base_url
      # @type [String]
      @token = token
      # @type [Hash{String => Object}]
      @additional_headers = additional_headers
      # @type [Hash{String => Object}]
      @additional_query_parameters = additional_query_parameters
      # @type [Hash{String => Object}]
      @additional_body_parameters = additional_body_parameters
      # @type [Long]
      @timeout_in_seconds = timeout_in_seconds
    end
  end
end
