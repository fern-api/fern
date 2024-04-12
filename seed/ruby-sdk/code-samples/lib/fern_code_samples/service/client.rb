# frozen_string_literal: true

require_relative "../../requests"
require_relative "types/my_response"
require "async"

module SeedCodeSamplesClient
  class ServiceClient
    # @return [SeedCodeSamplesClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedCodeSamplesClient::RequestClient]
    # @return [SeedCodeSamplesClient::ServiceClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param num_events [Integer]
    # @param request_options [SeedCodeSamplesClient::RequestOptions]
    # @return [SeedCodeSamplesClient::Service::MyResponse]
    # @example
    #   require "fern_code_samples"
    #
    # code_samples = class RequestClient
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
    #  # @return [SeedCodeSamplesClient::RequestClient]
    #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
    #  @base_url = base_url
    #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
    #  'fern_code_samples', "X-Fern-SDK-Version": '0.0.1' }
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
    #  # @param request_options [SeedCodeSamplesClient::RequestOptions]
    #  # @return [String]
    #  def get_url(request_options: nil)
    #  request_options&.base_url || @base_url
    #  end
    #  end.new
    #
    # code_samples.hello
    def hello(num_events:, request_options: nil)
      response = @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.body = { **(request_options&.additional_body_parameters || {}), num_events: num_events }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/hello"
      end
      SeedCodeSamplesClient::Service::MyResponse.from_json(json_object: response.body)
    end
  end

  class AsyncServiceClient
    # @return [SeedCodeSamplesClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedCodeSamplesClient::AsyncRequestClient]
    # @return [SeedCodeSamplesClient::AsyncServiceClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param num_events [Integer]
    # @param request_options [SeedCodeSamplesClient::RequestOptions]
    # @return [SeedCodeSamplesClient::Service::MyResponse]
    # @example
    #   require "fern_code_samples"
    #
    # code_samples = class RequestClient
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
    #  # @return [SeedCodeSamplesClient::RequestClient]
    #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
    #  @base_url = base_url
    #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
    #  'fern_code_samples', "X-Fern-SDK-Version": '0.0.1' }
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
    #  # @param request_options [SeedCodeSamplesClient::RequestOptions]
    #  # @return [String]
    #  def get_url(request_options: nil)
    #  request_options&.base_url || @base_url
    #  end
    #  end.new
    #
    # code_samples.hello
    def hello(num_events:, request_options: nil)
      Async do
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request_options&.additional_body_parameters || {}), num_events: num_events }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/hello"
        end
        SeedCodeSamplesClient::Service::MyResponse.from_json(json_object: response.body)
      end
    end
  end
end
