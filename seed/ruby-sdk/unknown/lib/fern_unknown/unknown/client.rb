# frozen_string_literal: true

require_relative "../../requests"
require "async"

module SeedUnknownAsAnyClient
  class UnknownClient
    # @return [SeedUnknownAsAnyClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedUnknownAsAnyClient::RequestClient]
    # @return [SeedUnknownAsAnyClient::UnknownClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param request [Object]
    # @param request_options [SeedUnknownAsAnyClient::RequestOptions]
    # @return [Array<Object>]
    def post(request: nil, request_options: nil)
      response = @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/"
      end
      response.body
    end
  end

  class AsyncUnknownClient
    # @return [SeedUnknownAsAnyClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedUnknownAsAnyClient::AsyncRequestClient]
    # @return [SeedUnknownAsAnyClient::AsyncUnknownClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param request [Object]
    # @param request_options [SeedUnknownAsAnyClient::RequestOptions]
    # @return [Array<Object>]
    def post(request: nil, request_options: nil)
      Async do
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/"
        end
        response.body
      end
    end
  end
end
