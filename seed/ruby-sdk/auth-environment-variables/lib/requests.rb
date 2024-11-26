# frozen_string_literal: true

require "faraday"
require "faraday/retry"
require "async/http/faraday"

module SeedAuthEnvironmentVariablesClient
  class RequestClient
    # @return [Faraday]
    attr_reader :conn
    # @return [String]
    attr_reader :base_url
    # @return [String]
    attr_reader :api_key

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param api_key [String]
    # @param x_another_header [String]
    # @param x_api_version [String]
    # @return [SeedAuthEnvironmentVariablesClient::RequestClient]
    def initialize(x_another_header:, x_api_version:, base_url: nil, max_retries: nil, timeout_in_seconds: nil,
                   api_key: ENV["FERN_API_KEY"])
      @base_url = base_url
      @api_key = api_key
      @headers = {}
      @headers["X-Another-Header"] = x_another_header unless x_another_header.nil?
      @headers["X-API-Version"] = x_api_version unless x_api_version.nil?
      @conn = Faraday.new(headers: @headers) do |faraday|
        faraday.request :json
        faraday.response :raise_error, include_request: true
        faraday.request :retry, { max: max_retries } unless max_retries.nil?
        faraday.options.timeout = timeout_in_seconds unless timeout_in_seconds.nil?
      end
    end

    # @param request_options [SeedAuthEnvironmentVariablesClient::RequestOptions]
    # @return [String]
    def get_url(request_options: nil)
      request_options&.base_url || @base_url
    end

    # @return [Hash{String => String}]
    def get_headers
      headers = {
        "X-Fern-Language": "Ruby",
        "X-Fern-SDK-Name": "fern_auth_environment_variables",
        "X-Fern-SDK-Version": "0.0.1"
      }
      headers["X-FERN-API-KEY"] = (@api_key.is_a?(Method) ? @api_key.call : @api_key) unless @api_key.nil?
      headers
    end
  end

  class AsyncRequestClient
    # @return [Faraday]
    attr_reader :conn
    # @return [String]
    attr_reader :base_url
    # @return [String]
    attr_reader :api_key

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param api_key [String]
    # @param x_another_header [String]
    # @param x_api_version [String]
    # @return [SeedAuthEnvironmentVariablesClient::AsyncRequestClient]
    def initialize(x_another_header:, x_api_version:, base_url: nil, max_retries: nil, timeout_in_seconds: nil,
                   api_key: ENV["FERN_API_KEY"])
      @base_url = base_url
      @api_key = api_key
      @headers = {}
      @headers["X-Another-Header"] = x_another_header unless x_another_header.nil?
      @headers["X-API-Version"] = x_api_version unless x_api_version.nil?
      @conn = Faraday.new(headers: @headers) do |faraday|
        faraday.request :json
        faraday.response :raise_error, include_request: true
        faraday.adapter :async_http
        faraday.request :retry, { max: max_retries } unless max_retries.nil?
        faraday.options.timeout = timeout_in_seconds unless timeout_in_seconds.nil?
      end
    end

    # @param request_options [SeedAuthEnvironmentVariablesClient::RequestOptions]
    # @return [String]
    def get_url(request_options: nil)
      request_options&.base_url || @base_url
    end

    # @return [Hash{String => String}]
    def get_headers
      headers = {
        "X-Fern-Language": "Ruby",
        "X-Fern-SDK-Name": "fern_auth_environment_variables",
        "X-Fern-SDK-Version": "0.0.1"
      }
      headers["X-FERN-API-KEY"] = (@api_key.is_a?(Method) ? @api_key.call : @api_key) unless @api_key.nil?
      headers
    end
  end

  # Additional options for request-specific configuration when calling APIs via the
  #  SDK.
  class RequestOptions
    # @return [String]
    attr_reader :base_url
    # @return [String]
    attr_reader :api_key
    # @return [String]
    attr_reader :x_another_header
    # @return [String]
    attr_reader :x_api_version
    # @return [Hash{String => Object}]
    attr_reader :additional_headers
    # @return [Hash{String => Object}]
    attr_reader :additional_query_parameters
    # @return [Hash{String => Object}]
    attr_reader :additional_body_parameters
    # @return [Long]
    attr_reader :timeout_in_seconds

    # @param base_url [String]
    # @param api_key [String]
    # @param x_another_header [String]
    # @param x_api_version [String]
    # @param additional_headers [Hash{String => Object}]
    # @param additional_query_parameters [Hash{String => Object}]
    # @param additional_body_parameters [Hash{String => Object}]
    # @param timeout_in_seconds [Long]
    # @return [SeedAuthEnvironmentVariablesClient::RequestOptions]
    def initialize(base_url: nil, api_key: nil, x_another_header: nil, x_api_version: nil, additional_headers: nil,
                   additional_query_parameters: nil, additional_body_parameters: nil, timeout_in_seconds: nil)
      @base_url = base_url
      @api_key = api_key
      @x_another_header = x_another_header
      @x_api_version = x_api_version
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
    attr_reader :api_key
    # @return [String]
    attr_reader :x_another_header
    # @return [String]
    attr_reader :x_api_version
    # @return [Hash{String => Object}]
    attr_reader :additional_headers
    # @return [Hash{String => Object}]
    attr_reader :additional_query_parameters
    # @return [Hash{String => Object}]
    attr_reader :additional_body_parameters
    # @return [Long]
    attr_reader :timeout_in_seconds

    # @param base_url [String]
    # @param api_key [String]
    # @param x_another_header [String]
    # @param x_api_version [String]
    # @param additional_headers [Hash{String => Object}]
    # @param additional_query_parameters [Hash{String => Object}]
    # @param additional_body_parameters [Hash{String => Object}]
    # @param timeout_in_seconds [Long]
    # @return [SeedAuthEnvironmentVariablesClient::IdempotencyRequestOptions]
    def initialize(base_url: nil, api_key: nil, x_another_header: nil, x_api_version: nil, additional_headers: nil,
                   additional_query_parameters: nil, additional_body_parameters: nil, timeout_in_seconds: nil)
      @base_url = base_url
      @api_key = api_key
      @x_another_header = x_another_header
      @x_api_version = x_api_version
      @additional_headers = additional_headers
      @additional_query_parameters = additional_query_parameters
      @additional_body_parameters = additional_body_parameters
      @timeout_in_seconds = timeout_in_seconds
    end
  end
end
