# frozen_string_literal: true

require "faraday"
require "async/http/faraday"

module SeedLiteralHeadersClient
  class RequestClient
    attr_reader :headers, :base_url, :conn

    # @param environment [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param api_header [String]
    # @param api_test [Boolean]
    # @return [RequestClient]
    def initialize(api_header:, api_test:, environment: nil, max_retries: nil, timeout_in_seconds: nil)
      @base_url = environment
      @headers = {
        "X-Fern-Language": "Ruby",
        "X-Fern-SDK-Name": "SeedLiteralHeadersClient",
        "X-API-Header": "api_header",
        "X-API-Test": "api_test"
      }
      @conn = Faraday.new(@base_url, headers: @headers) do |faraday|
        faraday.request :json
        faraday.request :retry, { max: max_retries }
        faraday.options.timeout = timeout_in_seconds
      end
    end
  end

  class AsyncRequestClient
    attr_reader :headers, :base_url, :conn

    # @param environment [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param api_header [String]
    # @param api_test [Boolean]
    # @return [AsyncRequestClient]
    def initialize(api_header:, api_test:, environment: nil, max_retries: nil, timeout_in_seconds: nil)
      @base_url = environment
      @headers = {
        "X-Fern-Language": "Ruby",
        "X-Fern-SDK-Name": "SeedLiteralHeadersClient",
        "X-API-Header": "api_header",
        "X-API-Test": "api_test"
      }
      @conn = Faraday.new(@base_url, headers: @headers) do |faraday|
        faraday.request :json
        faraday.request :retry, { max: max_retries }
        faraday.options.timeout = timeout_in_seconds
        faraday.adapter = :async_http
      end
    end
  end

  # Additional options for request-specific configuration when calling APIs via the SDK.
  class RequestOptions
    attr_reader :max_retries, :timeout_in_seconds, :api_header, :api_test, :additional_headers,
                :additional_query_parameters, :additional_body_parameters

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param api_header [String]
    # @param api_test [Boolean]
    # @param additional_headers [Hash{String => Object}]
    # @param additional_query_parameters [Hash{String => Object}]
    # @param additional_body_parameters [Hash{String => Object}]
    # @return [RequestOptions]
    def initialize(api_header:, api_test:, max_retries: nil, timeout_in_seconds: nil, additional_headers: nil,
                   additional_query_parameters: nil, additional_body_parameters: nil)
      # @type [Long] The number of times to retry a failed request, defaults to 2.
      @max_retries = max_retries
      # @type [Long]
      @timeout_in_seconds = timeout_in_seconds
      # @type [String]
      @api_header = api_header
      # @type [Boolean]
      @api_test = api_test
      # @type [Hash{String => Object}]
      @additional_headers = additional_headers
      # @type [Hash{String => Object}]
      @additional_query_parameters = additional_query_parameters
      # @type [Hash{String => Object}]
      @additional_body_parameters = additional_body_parameters
    end
  end
end
