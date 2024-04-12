# frozen_string_literal: true

require_relative "../../requests"
require "async"

module SeedBytesClient
  class ServiceClient
    # @return [SeedBytesClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedBytesClient::RequestClient]
    # @return [SeedBytesClient::ServiceClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param request [String, IO] Base64 encoded bytes, or an IO object (e.g. Faraday::UploadIO, etc.)
    # @param request_options [SeedBytesClient::RequestOptions]
    # @return [Void]
    # @example
    #   require "fern_bytes"
    #
    # bytes = class RequestClient
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
    #  # @return [SeedBytesClient::RequestClient]
    #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
    #  @base_url = base_url
    #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name": 'fern_bytes',
    #  "X-Fern-SDK-Version": '0.0.1' }
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
    #  # @param request_options [SeedBytesClient::RequestOptions]
    #  # @return [String]
    #  def get_url(request_options: nil)
    #  request_options&.base_url || @base_url
    #  end
    #  end.new
    #
    # bytes.upload
    def upload(request:, request_options: nil)
      @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.headers["Content-Type"] = "application/octet-stream"
        req.body = request
        req.url "#{@request_client.get_url(request_options: request_options)}/upload-content"
      end
    end
  end

  class AsyncServiceClient
    # @return [SeedBytesClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedBytesClient::AsyncRequestClient]
    # @return [SeedBytesClient::AsyncServiceClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param request [String, IO] Base64 encoded bytes, or an IO object (e.g. Faraday::UploadIO, etc.)
    # @param request_options [SeedBytesClient::RequestOptions]
    # @return [Void]
    # @example
    #   require "fern_bytes"
    #
    # bytes = class RequestClient
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
    #  # @return [SeedBytesClient::RequestClient]
    #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
    #  @base_url = base_url
    #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name": 'fern_bytes',
    #  "X-Fern-SDK-Version": '0.0.1' }
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
    #  # @param request_options [SeedBytesClient::RequestOptions]
    #  # @return [String]
    #  def get_url(request_options: nil)
    #  request_options&.base_url || @base_url
    #  end
    #  end.new
    #
    # bytes.upload
    def upload(request:, request_options: nil)
      Async do
        @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.headers["Content-Type"] = "application/octet-stream"
          req.body = request
          req.url "#{@request_client.get_url(request_options: request_options)}/upload-content"
        end
      end
    end
  end
end
