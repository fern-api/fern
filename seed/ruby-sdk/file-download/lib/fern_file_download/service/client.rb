# frozen_string_literal: true

require_relative "../../requests"
require "async"

module SeedFileDownloadClient
  class ServiceClient
    # @return [SeedFileDownloadClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedFileDownloadClient::RequestClient]
    # @return [SeedFileDownloadClient::ServiceClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param request_options [SeedFileDownloadClient::RequestOptions]
    # @yield on_data[chunk, overall_received_bytes, env] Leverage the Faraday on_data callback which
    #  will receive tuples of strings, the sum of characters received so far, and the
    #  response environment. The latter will allow access to the response status,
    #  headers and reason, as well as the request info.
    # @return [Void]
    # @example
    #   require "fern_file_download"
    #
    # file_download = class RequestClient
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
    #  # @return [SeedFileDownloadClient::RequestClient]
    #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
    #  @base_url = base_url
    #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
    #  'fern_file_download', "X-Fern-SDK-Version": '0.0.1' }
    #  @conn = Faraday.new(headers: @headers) do | faraday |
    #  faraday.request :multipart
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
    #  # @param request_options [SeedFileDownloadClient::RequestOptions]
    #  # @return [String]
    #  def get_url(request_options: nil)
    #  request_options&.base_url || @base_url
    #  end
    #  end.new
    #
    # file_download.download_file
    def download_file(request_options: nil, &on_data)
      @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.options.on_data = on_data
        req.url "#{@request_client.get_url(request_options: request_options)}/"
      end
    end
  end

  class AsyncServiceClient
    # @return [SeedFileDownloadClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedFileDownloadClient::AsyncRequestClient]
    # @return [SeedFileDownloadClient::AsyncServiceClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param request_options [SeedFileDownloadClient::RequestOptions]
    # @yield on_data[chunk, overall_received_bytes, env] Leverage the Faraday on_data callback which
    #  will receive tuples of strings, the sum of characters received so far, and the
    #  response environment. The latter will allow access to the response status,
    #  headers and reason, as well as the request info.
    # @return [Void]
    # @example
    #   require "fern_file_download"
    #
    # file_download = class RequestClient
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
    #  # @return [SeedFileDownloadClient::RequestClient]
    #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
    #  @base_url = base_url
    #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
    #  'fern_file_download', "X-Fern-SDK-Version": '0.0.1' }
    #  @conn = Faraday.new(headers: @headers) do | faraday |
    #  faraday.request :multipart
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
    #  # @param request_options [SeedFileDownloadClient::RequestOptions]
    #  # @return [String]
    #  def get_url(request_options: nil)
    #  request_options&.base_url || @base_url
    #  end
    #  end.new
    #
    # file_download.download_file
    def download_file(request_options: nil, &on_data)
      Async do
        @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.options.on_data = on_data
          req.url "#{@request_client.get_url(request_options: request_options)}/"
        end
      end
    end
  end
end
