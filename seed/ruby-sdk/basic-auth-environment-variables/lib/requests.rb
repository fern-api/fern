# frozen_string_literal: true

require "faraday"
require "faraday/retry"
require "async/http/faraday"

module SeedBasicAuthEnvironmentVariablesClient
  class RequestClient
    # @return [Faraday]
    attr_reader :conn
    # @return [String]
    attr_reader :base_url
    # @return [String]
    attr_reader :basic_auth_token

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param username [String]
    # @param password [String]
    # @return [SeedBasicAuthEnvironmentVariablesClient::RequestClient]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil, username: ENV["USERNAME"],
                   password: ENV["PASSWORD"])
      @base_url = base_url
      @basic_auth_token = "Basic #{Base64.encode64("#{username}:#{password}")}"
      @conn = Faraday.new do |faraday|
        faraday.request :json
        faraday.response :raise_error, include_request: true
        faraday.request :retry, { max: max_retries } unless max_retries.nil?
        faraday.options.timeout = timeout_in_seconds unless timeout_in_seconds.nil?
      end
    end

    # @param request_options [SeedBasicAuthEnvironmentVariablesClient::RequestOptions]
    # @return [String]
    def get_url(request_options: nil)
      request_options&.base_url || @base_url
    end

    # @return [Hash{String => String}]
    def get_headers
      headers = {
        "X-Fern-Language": "Ruby",
        "X-Fern-SDK-Name": "fern_basic_auth_environment_variables",
        "X-Fern-SDK-Version": "0.0.1"
      }
      unless @basic_auth_token.nil?
        headers["Authorization"] =
          (@basic_auth_token.is_a?(Method) ? @basic_auth_token.call : @basic_auth_token)
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
    attr_reader :basic_auth_token

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param username [String]
    # @param password [String]
    # @return [SeedBasicAuthEnvironmentVariablesClient::AsyncRequestClient]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil, username: ENV["USERNAME"],
                   password: ENV["PASSWORD"])
      @base_url = base_url
      @basic_auth_token = "Basic #{Base64.encode64("#{username}:#{password}")}"
      @conn = Faraday.new do |faraday|
        faraday.request :json
        faraday.response :raise_error, include_request: true
        faraday.adapter :async_http
        faraday.request :retry, { max: max_retries } unless max_retries.nil?
        faraday.options.timeout = timeout_in_seconds unless timeout_in_seconds.nil?
      end
    end

    # @param request_options [SeedBasicAuthEnvironmentVariablesClient::RequestOptions]
    # @return [String]
    def get_url(request_options: nil)
      request_options&.base_url || @base_url
    end

    # @return [Hash{String => String}]
    def get_headers
      headers = {
        "X-Fern-Language": "Ruby",
        "X-Fern-SDK-Name": "fern_basic_auth_environment_variables",
        "X-Fern-SDK-Version": "0.0.1"
      }
      unless @basic_auth_token.nil?
        headers["Authorization"] =
          (@basic_auth_token.is_a?(Method) ? @basic_auth_token.call : @basic_auth_token)
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
    attr_reader :basic_auth_token
    # @return [Hash{String => Object}]
    attr_reader :additional_headers
    # @return [Hash{String => Object}]
    attr_reader :additional_query_parameters
    # @return [Hash{String => Object}]
    attr_reader :additional_body_parameters
    # @return [Long]
    attr_reader :timeout_in_seconds

    # @param base_url [String]
    # @param basic_auth_token [String]
    # @param additional_headers [Hash{String => Object}]
    # @param additional_query_parameters [Hash{String => Object}]
    # @param additional_body_parameters [Hash{String => Object}]
    # @param timeout_in_seconds [Long]
    # @return [SeedBasicAuthEnvironmentVariablesClient::RequestOptions]
    def initialize(base_url: nil, basic_auth_token: nil, additional_headers: nil, additional_query_parameters: nil,
                   additional_body_parameters: nil, timeout_in_seconds: nil)
      @base_url = base_url
      @basic_auth_token = basic_auth_token
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
    attr_reader :basic_auth_token
    # @return [Hash{String => Object}]
    attr_reader :additional_headers
    # @return [Hash{String => Object}]
    attr_reader :additional_query_parameters
    # @return [Hash{String => Object}]
    attr_reader :additional_body_parameters
    # @return [Long]
    attr_reader :timeout_in_seconds

    # @param base_url [String]
    # @param basic_auth_token [String]
    # @param additional_headers [Hash{String => Object}]
    # @param additional_query_parameters [Hash{String => Object}]
    # @param additional_body_parameters [Hash{String => Object}]
    # @param timeout_in_seconds [Long]
    # @return [SeedBasicAuthEnvironmentVariablesClient::IdempotencyRequestOptions]
    def initialize(base_url: nil, basic_auth_token: nil, additional_headers: nil, additional_query_parameters: nil,
                   additional_body_parameters: nil, timeout_in_seconds: nil)
      @base_url = base_url
      @basic_auth_token = basic_auth_token
      @additional_headers = additional_headers
      @additional_query_parameters = additional_query_parameters
      @additional_body_parameters = additional_body_parameters
      @timeout_in_seconds = timeout_in_seconds
    end
  end
end
