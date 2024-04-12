# frozen_string_literal: true

require_relative "../../requests"
require "async"

module SeedBasicAuthClient
  class BasicAuthClient
    # @return [SeedBasicAuthClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedBasicAuthClient::RequestClient]
    # @return [SeedBasicAuthClient::BasicAuthClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # GET request with basic auth scheme
    #
    # @param request_options [SeedBasicAuthClient::RequestOptions]
    # @return [Boolean]
    # @example
    #   require "fern_basic_auth"
    #
    # basic_auth = class RequestClient
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
    #  # @param username [String]
    #  # @param password [String]
    #  # @return [SeedBasicAuthClient::RequestClient]
    #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil,
    #  username:, password:)
    #  @base_url = base_url
    #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
    #  'fern_basic_auth', "X-Fern-SDK-Version": '0.0.1', "Authorization": 'Basic
    #  #{Base64.encode64("#{username}:#{password}")}' }
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
    #  # @param request_options [SeedBasicAuthClient::RequestOptions]
    #  # @return [String]
    #  def get_url(request_options: nil)
    #  request_options&.base_url || @base_url
    #  end
    #  end.new
    #
    # basic_auth.get_with_basic_auth
    def get_with_basic_auth(request_options: nil)
      response = @request_client.conn.get do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["username"] = request_options.username unless request_options&.username.nil?
        req.headers["password"] = request_options.password unless request_options&.password.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/basic-auth"
      end
      response.body
    end

    # POST request with basic auth scheme
    #
    # @param request [Object]
    # @param request_options [SeedBasicAuthClient::RequestOptions]
    # @return [Boolean]
    # @example
    #   require "fern_basic_auth"
    #
    # basic_auth = class RequestClient
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
    #  # @param username [String]
    #  # @param password [String]
    #  # @return [SeedBasicAuthClient::RequestClient]
    #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil,
    #  username:, password:)
    #  @base_url = base_url
    #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
    #  'fern_basic_auth', "X-Fern-SDK-Version": '0.0.1', "Authorization": 'Basic
    #  #{Base64.encode64("#{username}:#{password}")}' }
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
    #  # @param request_options [SeedBasicAuthClient::RequestOptions]
    #  # @return [String]
    #  def get_url(request_options: nil)
    #  request_options&.base_url || @base_url
    #  end
    #  end.new
    #
    # basic_auth.post_with_basic_auth
    def post_with_basic_auth(request: nil, request_options: nil)
      response = @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["username"] = request_options.username unless request_options&.username.nil?
        req.headers["password"] = request_options.password unless request_options&.password.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/basic-auth"
      end
      response.body
    end
  end

  class AsyncBasicAuthClient
    # @return [SeedBasicAuthClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedBasicAuthClient::AsyncRequestClient]
    # @return [SeedBasicAuthClient::AsyncBasicAuthClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # GET request with basic auth scheme
    #
    # @param request_options [SeedBasicAuthClient::RequestOptions]
    # @return [Boolean]
    # @example
    #   require "fern_basic_auth"
    #
    # basic_auth = class RequestClient
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
    #  # @param username [String]
    #  # @param password [String]
    #  # @return [SeedBasicAuthClient::RequestClient]
    #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil,
    #  username:, password:)
    #  @base_url = base_url
    #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
    #  'fern_basic_auth', "X-Fern-SDK-Version": '0.0.1', "Authorization": 'Basic
    #  #{Base64.encode64("#{username}:#{password}")}' }
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
    #  # @param request_options [SeedBasicAuthClient::RequestOptions]
    #  # @return [String]
    #  def get_url(request_options: nil)
    #  request_options&.base_url || @base_url
    #  end
    #  end.new
    #
    # basic_auth.get_with_basic_auth
    def get_with_basic_auth(request_options: nil)
      Async do
        response = @request_client.conn.get do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["username"] = request_options.username unless request_options&.username.nil?
          req.headers["password"] = request_options.password unless request_options&.password.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/basic-auth"
        end
        response.body
      end
    end

    # POST request with basic auth scheme
    #
    # @param request [Object]
    # @param request_options [SeedBasicAuthClient::RequestOptions]
    # @return [Boolean]
    # @example
    #   require "fern_basic_auth"
    #
    # basic_auth = class RequestClient
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
    #  # @param username [String]
    #  # @param password [String]
    #  # @return [SeedBasicAuthClient::RequestClient]
    #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil,
    #  username:, password:)
    #  @base_url = base_url
    #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
    #  'fern_basic_auth', "X-Fern-SDK-Version": '0.0.1', "Authorization": 'Basic
    #  #{Base64.encode64("#{username}:#{password}")}' }
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
    #  # @param request_options [SeedBasicAuthClient::RequestOptions]
    #  # @return [String]
    #  def get_url(request_options: nil)
    #  request_options&.base_url || @base_url
    #  end
    #  end.new
    #
    # basic_auth.post_with_basic_auth
    def post_with_basic_auth(request: nil, request_options: nil)
      Async do
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["username"] = request_options.username unless request_options&.username.nil?
          req.headers["password"] = request_options.password unless request_options&.password.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/basic-auth"
        end
        response.body
      end
    end
  end
end
