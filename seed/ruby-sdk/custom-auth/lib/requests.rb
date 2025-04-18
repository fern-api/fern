# frozen_string_literal: true

require "faraday"
require "faraday/retry"
require "async/http/faraday"

module SeedCustomAuthClient
  class RequestClient
    # @return [Faraday]
    attr_reader :conn
    # @return [String]
    attr_reader :base_url
    # @return [String]
    attr_reader :custom_auth_scheme

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param custom_auth_scheme [String]
    # @return [SeedCustomAuthClient::RequestClient]
    def initialize(custom_auth_scheme:, base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @base_url = base_url
      @custom_auth_scheme = custom_auth_scheme
      @conn = Faraday.new do |faraday|
        faraday.request :json
        faraday.response :raise_error, include_request: true
        faraday.request :retry, { max: max_retries } unless max_retries.nil?
        faraday.options.timeout = timeout_in_seconds unless timeout_in_seconds.nil?
      end
    end

    # @param request_options [SeedCustomAuthClient::RequestOptions]
    # @return [String]
    def get_url(request_options: nil)
      request_options&.base_url || @base_url
    end

    # @return [Hash{String => String}]
    def get_headers
      headers = { "X-Fern-Language": "Ruby", "X-Fern-SDK-Name": "fern_custom_auth", "X-Fern-SDK-Version": "0.0.1" }
      unless @custom_auth_scheme.nil?
        headers["X-API-KEY"] =
          (@custom_auth_scheme.is_a?(Method) ? @custom_auth_scheme.call : @custom_auth_scheme)
      end
      headers
    end
  end

  class AsyncRequestClient
    # @return [Faraday]
    attr_reader :conn
    # @return [String]
    attr_reader :base_url
    # @return [String]
    attr_reader :custom_auth_scheme

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param custom_auth_scheme [String]
    # @return [SeedCustomAuthClient::AsyncRequestClient]
    def initialize(custom_auth_scheme:, base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @base_url = base_url
      @custom_auth_scheme = custom_auth_scheme
      @conn = Faraday.new do |faraday|
        faraday.request :json
        faraday.response :raise_error, include_request: true
        faraday.adapter :async_http
        faraday.request :retry, { max: max_retries } unless max_retries.nil?
        faraday.options.timeout = timeout_in_seconds unless timeout_in_seconds.nil?
      end
    end

    # @param request_options [SeedCustomAuthClient::RequestOptions]
    # @return [String]
    def get_url(request_options: nil)
      request_options&.base_url || @base_url
    end

    # @return [Hash{String => String}]
    def get_headers
      headers = { "X-Fern-Language": "Ruby", "X-Fern-SDK-Name": "fern_custom_auth", "X-Fern-SDK-Version": "0.0.1" }
      unless @custom_auth_scheme.nil?
        headers["X-API-KEY"] =
          (@custom_auth_scheme.is_a?(Method) ? @custom_auth_scheme.call : @custom_auth_scheme)
      end
      headers
    end
  end

  # Additional options for request-specific configuration when calling APIs via the
  #  SDK.
  class RequestOptions
    # @return [String]
    attr_reader :base_url
    # @return [String]
    attr_reader :custom_auth_scheme
    # @return [Hash{String => Object}]
    attr_reader :additional_headers
    # @return [Hash{String => Object}]
    attr_reader :additional_query_parameters
    # @return [Hash{String => Object}]
    attr_reader :additional_body_parameters
    # @return [Long]
    attr_reader :timeout_in_seconds

    # @param base_url [String]
    # @param custom_auth_scheme [String]
    # @param additional_headers [Hash{String => Object}]
    # @param additional_query_parameters [Hash{String => Object}]
    # @param additional_body_parameters [Hash{String => Object}]
    # @param timeout_in_seconds [Long]
    # @return [SeedCustomAuthClient::RequestOptions]
    def initialize(base_url: nil, custom_auth_scheme: nil, additional_headers: nil, additional_query_parameters: nil,
                   additional_body_parameters: nil, timeout_in_seconds: nil)
      @base_url = base_url
      @custom_auth_scheme = custom_auth_scheme
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
    attr_reader :custom_auth_scheme
    # @return [Hash{String => Object}]
    attr_reader :additional_headers
    # @return [Hash{String => Object}]
    attr_reader :additional_query_parameters
    # @return [Hash{String => Object}]
    attr_reader :additional_body_parameters
    # @return [Long]
    attr_reader :timeout_in_seconds

    # @param base_url [String]
    # @param custom_auth_scheme [String]
    # @param additional_headers [Hash{String => Object}]
    # @param additional_query_parameters [Hash{String => Object}]
    # @param additional_body_parameters [Hash{String => Object}]
    # @param timeout_in_seconds [Long]
    # @return [SeedCustomAuthClient::IdempotencyRequestOptions]
    def initialize(base_url: nil, custom_auth_scheme: nil, additional_headers: nil, additional_query_parameters: nil,
                   additional_body_parameters: nil, timeout_in_seconds: nil)
      @base_url = base_url
      @custom_auth_scheme = custom_auth_scheme
      @additional_headers = additional_headers
      @additional_query_parameters = additional_query_parameters
      @additional_body_parameters = additional_body_parameters
      @timeout_in_seconds = timeout_in_seconds
    end
  end
end
