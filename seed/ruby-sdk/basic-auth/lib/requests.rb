# frozen_string_literal: true

require "faraday"
require "faraday/retry"
require "async/http/faraday"

module SeedBasicAuthClient
  class RequestClient
    attr_reader :headers, :default_environment, :conn, :base_url

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param username [String]
    # @param password [String]
    # @return [SeedBasicAuthClient::RequestClient]
    def initialize(username:, password:, base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @base_url = base_url
      @headers = {
        "X-Fern-Language": "Ruby",
        "X-Fern-SDK-Name": "fern_basic_auth",
        "X-Fern-SDK-Version": "0.0.1",
        "Authorization": %(Basic #{Base64.encode64("#{username}:#{password}")})
      }
      @conn = Faraday.new(headers: @headers) do |faraday|
        faraday.request :json
        faraday.response :raise_error, include_request: true
        faraday.request :retry, { max: max_retries } unless max_retries.nil?
        faraday.options.timeout = timeout_in_seconds unless timeout_in_seconds.nil?
      end
    end

    # @param request_options [SeedBasicAuthClient::RequestOptions]
    # @return [String]
    def get_url(request_options:)
      request_options&.base_url || @base_url
    end
  end

  class AsyncRequestClient
    attr_reader :headers, :default_environment, :conn, :base_url

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param username [String]
    # @param password [String]
    # @return [SeedBasicAuthClient::AsyncRequestClient]
    def initialize(username:, password:, base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @base_url = base_url
      @headers = {
        "X-Fern-Language": "Ruby",
        "X-Fern-SDK-Name": "fern_basic_auth",
        "X-Fern-SDK-Version": "0.0.1",
        "Authorization": %(Basic #{Base64.encode64("#{username}:#{password}")})
      }
      @conn = Faraday.new(headers: @headers) do |faraday|
        faraday.request :json
        faraday.response :raise_error, include_request: true
        faraday.adapter :async_http
        faraday.request :retry, { max: max_retries } unless max_retries.nil?
        faraday.options.timeout = timeout_in_seconds unless timeout_in_seconds.nil?
      end
    end

    # @param request_options [SeedBasicAuthClient::RequestOptions]
    # @return [String]
    def get_url(request_options:)
      request_options&.base_url || @base_url
    end
  end

  # Additional options for request-specific configuration when calling APIs via the SDK.
  class RequestOptions
    attr_reader :base_url, :username, :password, :additional_headers, :additional_query_parameters,
                :additional_body_parameters, :timeout_in_seconds

    # @param base_url [String]
    # @param username [String]
    # @param password [String]
    # @param additional_headers [Hash{String => Object}]
    # @param additional_query_parameters [Hash{String => Object}]
    # @param additional_body_parameters [Hash{String => Object}]
    # @param timeout_in_seconds [Long]
    # @return [SeedBasicAuthClient::RequestOptions]
    def initialize(base_url: nil, username: nil, password: nil, additional_headers: nil,
                   additional_query_parameters: nil, additional_body_parameters: nil, timeout_in_seconds: nil)
      # @type [String]
      @base_url = base_url
      # @type [String]
      @username = username
      # @type [String]
      @password = password
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
    attr_reader :base_url, :username, :password, :additional_headers, :additional_query_parameters,
                :additional_body_parameters, :timeout_in_seconds

    # @param base_url [String]
    # @param username [String]
    # @param password [String]
    # @param additional_headers [Hash{String => Object}]
    # @param additional_query_parameters [Hash{String => Object}]
    # @param additional_body_parameters [Hash{String => Object}]
    # @param timeout_in_seconds [Long]
    # @return [SeedBasicAuthClient::IdempotencyRequestOptions]
    def initialize(base_url: nil, username: nil, password: nil, additional_headers: nil,
                   additional_query_parameters: nil, additional_body_parameters: nil, timeout_in_seconds: nil)
      # @type [String]
      @base_url = base_url
      # @type [String]
      @username = username
      # @type [String]
      @password = password
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
