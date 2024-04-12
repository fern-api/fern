# frozen_string_literal: true

require_relative "../../requests"
require "async"

module SeedNurseryApiClient
  class PackageClient
    # @return [SeedNurseryApiClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedNurseryApiClient::RequestClient]
    # @return [SeedNurseryApiClient::PackageClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param for_ [String]
    # @param request_options [SeedNurseryApiClient::RequestOptions]
    # @return [Void]
    # @example
    #   require "fern_reserved_keywords"
    #
    # nursery_api = class RequestClient
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
    #  # @return [SeedNurseryApiClient::RequestClient]
    #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
    #  @base_url = base_url
    #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
    #  'fern_reserved_keywords', "X-Fern-SDK-Version": '0.0.1' }
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
    #  # @param request_options [SeedNurseryApiClient::RequestOptions]
    #  # @return [String]
    #  def get_url(request_options: nil)
    #  request_options&.base_url || @base_url
    #  end
    #  end.new
    #
    # nursery_api.test
    def test(for_:, request_options: nil)
      @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.params = { **(request_options&.additional_query_parameters || {}), "for": for_ }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/"
      end
    end
  end

  class AsyncPackageClient
    # @return [SeedNurseryApiClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedNurseryApiClient::AsyncRequestClient]
    # @return [SeedNurseryApiClient::AsyncPackageClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param for_ [String]
    # @param request_options [SeedNurseryApiClient::RequestOptions]
    # @return [Void]
    # @example
    #   require "fern_reserved_keywords"
    #
    # nursery_api = class RequestClient
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
    #  # @return [SeedNurseryApiClient::RequestClient]
    #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
    #  @base_url = base_url
    #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
    #  'fern_reserved_keywords', "X-Fern-SDK-Version": '0.0.1' }
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
    #  # @param request_options [SeedNurseryApiClient::RequestOptions]
    #  # @return [String]
    #  def get_url(request_options: nil)
    #  request_options&.base_url || @base_url
    #  end
    #  end.new
    #
    # nursery_api.test
    def test(for_:, request_options: nil)
      Async do
        @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.params = { **(request_options&.additional_query_parameters || {}), "for": for_ }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/"
        end
      end
    end
  end
end
