# frozen_string_literal: true

require_relative "../../requests"
require "async"

module SeedBearerTokenEnvironmentVariableClient
  class ServiceClient
    # @return [SeedBearerTokenEnvironmentVariableClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedBearerTokenEnvironmentVariableClient::RequestClient]
    # @return [SeedBearerTokenEnvironmentVariableClient::ServiceClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # GET request with custom api key
    #
    # @param request_options [SeedBearerTokenEnvironmentVariableClient::RequestOptions]
    # @return [String]
    # @example
    #   require "fern_bearer_token_environment_variable"
    #
    # bearer_token_environment_variable = class RequestClient
    #  # @return [Hash{String => String}]
    #  attr_reader :headers
    #  # @return [Faraday]
    #  attr_reader :conn
    #  # @return [String]
    #  attr_reader :base_url
    #  # @param base_url [String]
    #  # @param max_retries [Long] The number of times to retry a failed request,
    #  defaults to 2.
    #  # @param timeout_in_seconds [Long]
    #  # @param api_key [String]
    #  # @return [SeedBearerTokenEnvironmentVariableClient::RequestClient]
    #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil,
    #  api_key: nil)
    #  @base_url = base_url
    #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
    #  'fern_bearer_token_environment_variable', "X-Fern-SDK-Version": '0.0.1',
    #  "Authorization": 'Bearer #{api_key || ENV["COURIER_API_KEY"]}' }
    #  @conn = Faraday.new(headers: @headers) do | faraday |
    #  faraday.request :json
    #  faraday.response :raise_error, include_request: true
    #  unless max_retries.nil?
    #  faraday.request :retry ,  { max: max_retries }
    #  end
    #  unless timeout_in_seconds.nil?
    #  faraday.options.timeout = timeout_in_seconds
    #  end
    #  end
    #  end
    #  # @param request_options
    #  [SeedBearerTokenEnvironmentVariableClient::RequestOptions]
    #  # @return [String]
    #  def get_url(request_options: nil)
    #  request_options&.base_url || @base_url
    #  end
    #  end.new
    #
    # bearer_token_environment_variable.get_with_bearer_token
    def get_with_bearer_token(request_options: nil)
      response = @request_client.conn.get do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.api_key unless request_options&.api_key.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/apiKey"
      end
      response.body
    end
  end

  class AsyncServiceClient
    # @return [SeedBearerTokenEnvironmentVariableClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedBearerTokenEnvironmentVariableClient::AsyncRequestClient]
    # @return [SeedBearerTokenEnvironmentVariableClient::AsyncServiceClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # GET request with custom api key
    #
    # @param request_options [SeedBearerTokenEnvironmentVariableClient::RequestOptions]
    # @return [String]
    # @example
    #   require "fern_bearer_token_environment_variable"
    #
    # bearer_token_environment_variable = class RequestClient
    #  # @return [Hash{String => String}]
    #  attr_reader :headers
    #  # @return [Faraday]
    #  attr_reader :conn
    #  # @return [String]
    #  attr_reader :base_url
    #  # @param base_url [String]
    #  # @param max_retries [Long] The number of times to retry a failed request,
    #  defaults to 2.
    #  # @param timeout_in_seconds [Long]
    #  # @param api_key [String]
    #  # @return [SeedBearerTokenEnvironmentVariableClient::RequestClient]
    #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil,
    #  api_key: nil)
    #  @base_url = base_url
    #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
    #  'fern_bearer_token_environment_variable', "X-Fern-SDK-Version": '0.0.1',
    #  "Authorization": 'Bearer #{api_key || ENV["COURIER_API_KEY"]}' }
    #  @conn = Faraday.new(headers: @headers) do | faraday |
    #  faraday.request :json
    #  faraday.response :raise_error, include_request: true
    #  unless max_retries.nil?
    #  faraday.request :retry ,  { max: max_retries }
    #  end
    #  unless timeout_in_seconds.nil?
    #  faraday.options.timeout = timeout_in_seconds
    #  end
    #  end
    #  end
    #  # @param request_options
    #  [SeedBearerTokenEnvironmentVariableClient::RequestOptions]
    #  # @return [String]
    #  def get_url(request_options: nil)
    #  request_options&.base_url || @base_url
    #  end
    #  end.new
    #
    # bearer_token_environment_variable.get_with_bearer_token
    def get_with_bearer_token(request_options: nil)
      Async do
        response = @request_client.conn.get do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.api_key unless request_options&.api_key.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/apiKey"
        end
        response.body
      end
    end
  end
end
