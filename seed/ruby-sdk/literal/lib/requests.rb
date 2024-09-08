# frozen_string_literal: true

require "faraday"
require "faraday/retry"
require "async/http/faraday"

module SeedLiteralClient
  class RequestClient
    # @return [Faraday]
    attr_reader :conn
    # @return [String]
    attr_reader :base_url

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param version [String]
    # @param audit_logging [Boolean]
    # @return [SeedLiteralClient::RequestClient]
    def initialize(version:, audit_logging:, base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @base_url = base_url
      @headers = {}
      @headers["X-API-Version"] = version unless version.nil?
      @headers["X-API-Enable-Audit-Logging"] = audit_logging unless audit_logging.nil?
      @conn = Faraday.new(headers: @headers) do |faraday|
        faraday.request :json
        faraday.response :raise_error, include_request: true
        faraday.request :retry, { max: max_retries } unless max_retries.nil?
        faraday.options.timeout = timeout_in_seconds unless timeout_in_seconds.nil?
      end
    end

    # @param request_options [SeedLiteralClient::RequestOptions]
    # @return [String]
    def get_url(request_options: nil)
      request_options&.base_url || @base_url
    end

    # @return [Hash{String => String}]
    def get_headers
      { "X-Fern-Language": "Ruby", "X-Fern-SDK-Name": "fern_literal", "X-Fern-SDK-Version": "0.0.1" }
    end
  end

  class AsyncRequestClient
    # @return [Faraday]
    attr_reader :conn
    # @return [String]
    attr_reader :base_url

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param version [String]
    # @param audit_logging [Boolean]
    # @return [SeedLiteralClient::AsyncRequestClient]
    def initialize(version:, audit_logging:, base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @base_url = base_url
      @headers = {}
      @headers["X-API-Version"] = version unless version.nil?
      @headers["X-API-Enable-Audit-Logging"] = audit_logging unless audit_logging.nil?
      @conn = Faraday.new(headers: @headers) do |faraday|
        faraday.request :json
        faraday.response :raise_error, include_request: true
        faraday.adapter :async_http
        faraday.request :retry, { max: max_retries } unless max_retries.nil?
        faraday.options.timeout = timeout_in_seconds unless timeout_in_seconds.nil?
      end
    end

    # @param request_options [SeedLiteralClient::RequestOptions]
    # @return [String]
    def get_url(request_options: nil)
      request_options&.base_url || @base_url
    end

    # @return [Hash{String => String}]
    def get_headers
      { "X-Fern-Language": "Ruby", "X-Fern-SDK-Name": "fern_literal", "X-Fern-SDK-Version": "0.0.1" }
    end
  end

  # Additional options for request-specific configuration when calling APIs via the
  #  SDK.
  class RequestOptions
    # @return [String]
    attr_reader :base_url
    # @return [String]
    attr_reader :version
    # @return [Boolean]
    attr_reader :audit_logging
    # @return [Hash{String => Object}]
    attr_reader :additional_headers
    # @return [Hash{String => Object}]
    attr_reader :additional_query_parameters
    # @return [Hash{String => Object}]
    attr_reader :additional_body_parameters
    # @return [Long]
    attr_reader :timeout_in_seconds

    # @param base_url [String]
    # @param version [String]
    # @param audit_logging [Boolean]
    # @param additional_headers [Hash{String => Object}]
    # @param additional_query_parameters [Hash{String => Object}]
    # @param additional_body_parameters [Hash{String => Object}]
    # @param timeout_in_seconds [Long]
    # @return [SeedLiteralClient::RequestOptions]
    def initialize(base_url: nil, version: nil, audit_logging: nil, additional_headers: nil,
                   additional_query_parameters: nil, additional_body_parameters: nil, timeout_in_seconds: nil)
      @base_url = base_url
      @version = version
      @audit_logging = audit_logging
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
    attr_reader :version
    # @return [Boolean]
    attr_reader :audit_logging
    # @return [Hash{String => Object}]
    attr_reader :additional_headers
    # @return [Hash{String => Object}]
    attr_reader :additional_query_parameters
    # @return [Hash{String => Object}]
    attr_reader :additional_body_parameters
    # @return [Long]
    attr_reader :timeout_in_seconds

    # @param base_url [String]
    # @param version [String]
    # @param audit_logging [Boolean]
    # @param additional_headers [Hash{String => Object}]
    # @param additional_query_parameters [Hash{String => Object}]
    # @param additional_body_parameters [Hash{String => Object}]
    # @param timeout_in_seconds [Long]
    # @return [SeedLiteralClient::IdempotencyRequestOptions]
    def initialize(base_url: nil, version: nil, audit_logging: nil, additional_headers: nil,
                   additional_query_parameters: nil, additional_body_parameters: nil, timeout_in_seconds: nil)
      @base_url = base_url
      @version = version
      @audit_logging = audit_logging
      @additional_headers = additional_headers
      @additional_query_parameters = additional_query_parameters
      @additional_body_parameters = additional_body_parameters
      @timeout_in_seconds = timeout_in_seconds
    end
  end
end
