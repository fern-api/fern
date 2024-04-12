# frozen_string_literal: true

require_relative "../../requests"
require_relative "types/resource"
require "date"
require "async"

module SeedMixedCaseClient
  class ServiceClient
    # @return [SeedMixedCaseClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedMixedCaseClient::RequestClient]
    # @return [SeedMixedCaseClient::ServiceClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param resource_id [String]
    # @param request_options [SeedMixedCaseClient::RequestOptions]
    # @return [SeedMixedCaseClient::Service::Resource]
    # @example
    #   require "fern_mixed_case"
    #
    # mixed_case = class RequestClient
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
    #  # @return [SeedMixedCaseClient::RequestClient]
    #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
    #  @base_url = base_url
    #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
    #  'fern_mixed_case', "X-Fern-SDK-Version": '0.0.1' }
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
    #  # @param request_options [SeedMixedCaseClient::RequestOptions]
    #  # @return [String]
    #  def get_url(request_options: nil)
    #  request_options&.base_url || @base_url
    #  end
    #  end.new
    #
    # mixed_case.get_resource
    def get_resource(resource_id:, request_options: nil)
      response = @request_client.conn.get do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/resource/#{resource_id}"
      end
      SeedMixedCaseClient::Service::Resource.from_json(json_object: response.body)
    end

    # @param page_limit [Integer]
    # @param before_date [Date]
    # @param request_options [SeedMixedCaseClient::RequestOptions]
    # @return [Array<SeedMixedCaseClient::Service::Resource>]
    # @example
    #   require "fern_mixed_case"
    #
    # mixed_case = class RequestClient
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
    #  # @return [SeedMixedCaseClient::RequestClient]
    #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
    #  @base_url = base_url
    #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
    #  'fern_mixed_case', "X-Fern-SDK-Version": '0.0.1' }
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
    #  # @param request_options [SeedMixedCaseClient::RequestOptions]
    #  # @return [String]
    #  def get_url(request_options: nil)
    #  request_options&.base_url || @base_url
    #  end
    #  end.new
    #
    # mixed_case.list_resources
    def list_resources(page_limit:, before_date:, request_options: nil)
      response = @request_client.conn.get do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.params = {
          **(request_options&.additional_query_parameters || {}),
          "page_limit": page_limit,
          "beforeDate": before_date
        }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/resource"
      end
      response.body&.map do |v|
        v = v.to_json
        SeedMixedCaseClient::Service::Resource.from_json(json_object: v)
      end
    end
  end

  class AsyncServiceClient
    # @return [SeedMixedCaseClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedMixedCaseClient::AsyncRequestClient]
    # @return [SeedMixedCaseClient::AsyncServiceClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param resource_id [String]
    # @param request_options [SeedMixedCaseClient::RequestOptions]
    # @return [SeedMixedCaseClient::Service::Resource]
    # @example
    #   require "fern_mixed_case"
    #
    # mixed_case = class RequestClient
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
    #  # @return [SeedMixedCaseClient::RequestClient]
    #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
    #  @base_url = base_url
    #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
    #  'fern_mixed_case', "X-Fern-SDK-Version": '0.0.1' }
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
    #  # @param request_options [SeedMixedCaseClient::RequestOptions]
    #  # @return [String]
    #  def get_url(request_options: nil)
    #  request_options&.base_url || @base_url
    #  end
    #  end.new
    #
    # mixed_case.get_resource
    def get_resource(resource_id:, request_options: nil)
      Async do
        response = @request_client.conn.get do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/resource/#{resource_id}"
        end
        SeedMixedCaseClient::Service::Resource.from_json(json_object: response.body)
      end
    end

    # @param page_limit [Integer]
    # @param before_date [Date]
    # @param request_options [SeedMixedCaseClient::RequestOptions]
    # @return [Array<SeedMixedCaseClient::Service::Resource>]
    # @example
    #   require "fern_mixed_case"
    #
    # mixed_case = class RequestClient
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
    #  # @return [SeedMixedCaseClient::RequestClient]
    #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
    #  @base_url = base_url
    #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
    #  'fern_mixed_case', "X-Fern-SDK-Version": '0.0.1' }
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
    #  # @param request_options [SeedMixedCaseClient::RequestOptions]
    #  # @return [String]
    #  def get_url(request_options: nil)
    #  request_options&.base_url || @base_url
    #  end
    #  end.new
    #
    # mixed_case.list_resources
    def list_resources(page_limit:, before_date:, request_options: nil)
      Async do
        response = @request_client.conn.get do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.params = {
            **(request_options&.additional_query_parameters || {}),
            "page_limit": page_limit,
            "beforeDate": before_date
          }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/resource"
        end
        response.body&.map do |v|
          v = v.to_json
          SeedMixedCaseClient::Service::Resource.from_json(json_object: v)
        end
      end
    end
  end
end
