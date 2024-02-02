# frozen_string_literal: true

require "async/http/faraday"
require "faraday"

module SeedSingleUrlEnvironmentDefaultClient
  class RequestClient
    attr_reader :headers, :base_url, :conn

    # @param environment [Environment]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [RequestClient]
    def initialize(environment: Environment::PRODUCTION, max_retries: nil, timeout_in_seconds: nil, token: nil)
      @default_environment = environment
      @base_url = environment
      @headers = {
        "X-Fern-Language": "Ruby",
        "X-Fern-SDK-Name": "SeedSingleUrlEnvironmentDefaultClient",
        "Authorization": "Bearer #{token}"
      }
      @conn = Faraday.new(@base_url, headers: @headers) do |faraday|
        faraday.request :json
        faraday.request :retry, { max: max_retries }
        faraday.response :raise_error, include_request: true
        faraday.options.timeout = timeout_in_seconds
      end
    end
  end

  class AsyncRequestClient
    attr_reader :headers, :base_url, :conn

    # @param environment [Environment]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [AsyncRequestClient]
    def initialize(environment: Environment::PRODUCTION, max_retries: nil, timeout_in_seconds: nil, token: nil)
      @default_environment = environment
      @base_url = environment
      @headers = {
        "X-Fern-Language": "Ruby",
        "X-Fern-SDK-Name": "SeedSingleUrlEnvironmentDefaultClient",
        "Authorization": "Bearer #{token}"
      }
      @conn = Faraday.new(@base_url, headers: @headers) do |faraday|
        faraday.request :json
        faraday.request :retry, { max: max_retries }
        faraday.response :raise_error, include_request: true
        faraday.options.timeout = timeout_in_seconds
        faraday.adapter = :async_http
      end
    end
  end

  # Additional options for request-specific configuration when calling APIs via the SDK.
  class RequestOptions
    attr_reader :timeout_in_seconds, :token, :additional_headers, :additional_query_parameters,
                :additional_body_parameters

    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @param additional_headers [Hash{String => Object}]
    # @param additional_query_parameters [Hash{String => Object}]
    # @param additional_body_parameters [Hash{String => Object}]
    # @return [RequestOptions]
    def initialize(token:, timeout_in_seconds: nil, additional_headers: nil, additional_query_parameters: nil,
                   additional_body_parameters: nil)
      # @type [Long]
      @timeout_in_seconds = timeout_in_seconds
      # @type [String]
      @token = token
      # @type [Hash{String => Object}]
      @additional_headers = additional_headers
      # @type [Hash{String => Object}]
      @additional_query_parameters = additional_query_parameters
      # @type [Hash{String => Object}]
      @additional_body_parameters = additional_body_parameters
    end
  end
end
