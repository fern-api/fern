# frozen_string_literal: true

require_relative "../../requests"
require "async"

module SeedErrorPropertyClient
  class PropertyBasedErrorClient
    attr_reader :request_client

    # @param request_client [SeedErrorPropertyClient::RequestClient]
    # @return [SeedErrorPropertyClient::PropertyBasedErrorClient]
    def initialize(request_client:)
      # @type [SeedErrorPropertyClient::RequestClient]
      @request_client = request_client
    end

    # GET request that always throws an error
    #
    # @param request_options [SeedErrorPropertyClient::RequestOptions]
    # @return [String]
    def throw_error(request_options: nil)
      response = @request_client.conn.get do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/property-based-error"
      end
      response.body
    end
  end

  class AsyncPropertyBasedErrorClient
    attr_reader :request_client

    # @param request_client [SeedErrorPropertyClient::AsyncRequestClient]
    # @return [SeedErrorPropertyClient::AsyncPropertyBasedErrorClient]
    def initialize(request_client:)
      # @type [SeedErrorPropertyClient::AsyncRequestClient]
      @request_client = request_client
    end

    # GET request that always throws an error
    #
    # @param request_options [SeedErrorPropertyClient::RequestOptions]
    # @return [String]
    def throw_error(request_options: nil)
      Async do
        response = @request_client.conn.get do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/property-based-error"
        end
        response.body
      end
    end
  end
end
