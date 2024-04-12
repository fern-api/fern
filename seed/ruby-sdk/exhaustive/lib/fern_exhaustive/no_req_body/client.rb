# frozen_string_literal: true

require_relative "../../requests"
require_relative "../types/object/types/object_with_optional_field"
require "async"

module SeedExhaustiveClient
  class NoReqBodyClient
    # @return [SeedExhaustiveClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedExhaustiveClient::RequestClient]
    # @return [SeedExhaustiveClient::NoReqBodyClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param request_options [SeedExhaustiveClient::RequestOptions]
    # @return [SeedExhaustiveClient::Types::Object::ObjectWithOptionalField]
    # @example
    #   require "fern_exhaustive"
    #
    # exhaustive = class RequestClient
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
    #  # @param token [String]
    #  # @return [SeedExhaustiveClient::RequestClient]
    #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil,
    #  token:)
    #  @base_url = base_url
    #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
    #  'fern_exhaustive', "X-Fern-SDK-Version": '0.0.1', "Authorization": 'Bearer
    #  #{token}' }
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
    #  # @param request_options [SeedExhaustiveClient::RequestOptions]
    #  # @return [String]
    #  def get_url(request_options: nil)
    #  request_options&.base_url || @base_url
    #  end
    #  end.new
    #
    # exhaustive.get_with_no_request_body
    def get_with_no_request_body(request_options: nil)
      response = @request_client.conn.get do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/no-req-body"
      end
      SeedExhaustiveClient::Types::Object::ObjectWithOptionalField.from_json(json_object: response.body)
    end

    # @param request_options [SeedExhaustiveClient::RequestOptions]
    # @return [String]
    # @example
    #   require "fern_exhaustive"
    #
    # exhaustive = class RequestClient
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
    #  # @param token [String]
    #  # @return [SeedExhaustiveClient::RequestClient]
    #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil,
    #  token:)
    #  @base_url = base_url
    #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
    #  'fern_exhaustive', "X-Fern-SDK-Version": '0.0.1', "Authorization": 'Bearer
    #  #{token}' }
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
    #  # @param request_options [SeedExhaustiveClient::RequestOptions]
    #  # @return [String]
    #  def get_url(request_options: nil)
    #  request_options&.base_url || @base_url
    #  end
    #  end.new
    #
    # exhaustive.post_with_no_request_body
    def post_with_no_request_body(request_options: nil)
      response = @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/no-req-body"
      end
      response.body
    end
  end

  class AsyncNoReqBodyClient
    # @return [SeedExhaustiveClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedExhaustiveClient::AsyncRequestClient]
    # @return [SeedExhaustiveClient::AsyncNoReqBodyClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param request_options [SeedExhaustiveClient::RequestOptions]
    # @return [SeedExhaustiveClient::Types::Object::ObjectWithOptionalField]
    # @example
    #   require "fern_exhaustive"
    #
    # exhaustive = class RequestClient
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
    #  # @param token [String]
    #  # @return [SeedExhaustiveClient::RequestClient]
    #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil,
    #  token:)
    #  @base_url = base_url
    #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
    #  'fern_exhaustive', "X-Fern-SDK-Version": '0.0.1', "Authorization": 'Bearer
    #  #{token}' }
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
    #  # @param request_options [SeedExhaustiveClient::RequestOptions]
    #  # @return [String]
    #  def get_url(request_options: nil)
    #  request_options&.base_url || @base_url
    #  end
    #  end.new
    #
    # exhaustive.get_with_no_request_body
    def get_with_no_request_body(request_options: nil)
      Async do
        response = @request_client.conn.get do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/no-req-body"
        end
        SeedExhaustiveClient::Types::Object::ObjectWithOptionalField.from_json(json_object: response.body)
      end
    end

    # @param request_options [SeedExhaustiveClient::RequestOptions]
    # @return [String]
    # @example
    #   require "fern_exhaustive"
    #
    # exhaustive = class RequestClient
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
    #  # @param token [String]
    #  # @return [SeedExhaustiveClient::RequestClient]
    #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil,
    #  token:)
    #  @base_url = base_url
    #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
    #  'fern_exhaustive', "X-Fern-SDK-Version": '0.0.1', "Authorization": 'Bearer
    #  #{token}' }
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
    #  # @param request_options [SeedExhaustiveClient::RequestOptions]
    #  # @return [String]
    #  def get_url(request_options: nil)
    #  request_options&.base_url || @base_url
    #  end
    #  end.new
    #
    # exhaustive.post_with_no_request_body
    def post_with_no_request_body(request_options: nil)
      Async do
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/no-req-body"
        end
        response.body
      end
    end
  end
end
