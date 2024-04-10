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
