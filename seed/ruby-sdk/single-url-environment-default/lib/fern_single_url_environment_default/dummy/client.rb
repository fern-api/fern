# frozen_string_literal: true

require_relative "../../requests"
require "async"

module SeedSingleUrlEnvironmentDefaultClient
  class DummyClient
    # @return [SeedSingleUrlEnvironmentDefaultClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedSingleUrlEnvironmentDefaultClient::RequestClient]
    # @return [SeedSingleUrlEnvironmentDefaultClient::DummyClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param request_options [SeedSingleUrlEnvironmentDefaultClient::RequestOptions]
    # @return [String]
    # @example
    #   require "fern_single_url_environment_default"
    #
    # single_url_environment_default = class RequestClient
    #  # @return [Hash{String => String}]
    #  attr_reader :headers
    #  # @return [Faraday]
    #  attr_reader :conn
    #  # @return [String]
    #  attr_reader :base_url
    #  # @return [String]
    #  attr_reader :default_environment
    #  # @param environment [SeedSingleUrlEnvironmentDefaultClient::Environment]
    #  # @param base_url [String]
    #  # @param max_retries [Long] The number of times to retry a failed request,
    #  defaults to 2.
    #  # @param timeout_in_seconds [Long]
    #  # @param token [String]
    #  # @return [SeedSingleUrlEnvironmentDefaultClient::RequestClient]
    #  def initialize(environment: Environment::PRODUCTION, base_url: nil,
    #  max_retries: nil, timeout_in_seconds: nil, token:)
    #  @default_environment = environment
    #  @base_url = environment || base_url
    #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
    #  'fern_single_url_environment_default', "X-Fern-SDK-Version": '0.0.1',
    #  "Authorization": 'Bearer #{token}' }
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
    #  [SeedSingleUrlEnvironmentDefaultClient::RequestOptions]
    #  # @return [String]
    #  def get_url(request_options: nil)
    #  request_options&.base_url || @default_environment || @base_url
    #  end
    #  end.new
    #
    # single_url_environment_default.get_dummy
    def get_dummy(request_options: nil)
      response = @request_client.conn.get do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/dummy"
      end
      response.body
    end
  end

  class AsyncDummyClient
    # @return [SeedSingleUrlEnvironmentDefaultClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedSingleUrlEnvironmentDefaultClient::AsyncRequestClient]
    # @return [SeedSingleUrlEnvironmentDefaultClient::AsyncDummyClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param request_options [SeedSingleUrlEnvironmentDefaultClient::RequestOptions]
    # @return [String]
    # @example
    #   require "fern_single_url_environment_default"
    #
    # single_url_environment_default = class RequestClient
    #  # @return [Hash{String => String}]
    #  attr_reader :headers
    #  # @return [Faraday]
    #  attr_reader :conn
    #  # @return [String]
    #  attr_reader :base_url
    #  # @return [String]
    #  attr_reader :default_environment
    #  # @param environment [SeedSingleUrlEnvironmentDefaultClient::Environment]
    #  # @param base_url [String]
    #  # @param max_retries [Long] The number of times to retry a failed request,
    #  defaults to 2.
    #  # @param timeout_in_seconds [Long]
    #  # @param token [String]
    #  # @return [SeedSingleUrlEnvironmentDefaultClient::RequestClient]
    #  def initialize(environment: Environment::PRODUCTION, base_url: nil,
    #  max_retries: nil, timeout_in_seconds: nil, token:)
    #  @default_environment = environment
    #  @base_url = environment || base_url
    #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
    #  'fern_single_url_environment_default', "X-Fern-SDK-Version": '0.0.1',
    #  "Authorization": 'Bearer #{token}' }
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
    #  [SeedSingleUrlEnvironmentDefaultClient::RequestOptions]
    #  # @return [String]
    #  def get_url(request_options: nil)
    #  request_options&.base_url || @default_environment || @base_url
    #  end
    #  end.new
    #
    # single_url_environment_default.get_dummy
    def get_dummy(request_options: nil)
      Async do
        response = @request_client.conn.get do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/dummy"
        end
        response.body
      end
    end
  end
end
