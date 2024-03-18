# frozen_string_literal: true

require_relative "../../requests"
require "async"

module SeedErrorPropertyClient
  class PropertyBasedErrorClient
    attr_reader :request_client

    # @param request_client [RequestClient]
    # @return [PropertyBasedErrorClient]
    def initialize(request_client:)
      # @type [RequestClient]
      @request_client = request_client
    end

    # GET request that always throws an error
    #
    # @param request_options [RequestOptions]
    # @return [String]
    def throw_error(request_options: nil)
      response = @request_client.conn.get("/property-based-error") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
      end
      response.body
    end
  end

  class AsyncPropertyBasedErrorClient
    attr_reader :request_client

    # @param request_client [AsyncRequestClient]
    # @return [AsyncPropertyBasedErrorClient]
    def initialize(request_client:)
      # @type [AsyncRequestClient]
      @request_client = request_client
    end

    # GET request that always throws an error
    #
    # @param request_options [RequestOptions]
    # @return [String]
    def throw_error(request_options: nil)
      Async do
        response = @request_client.conn.get("/property-based-error") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        end
        response.body
      end
    end
  end
end
