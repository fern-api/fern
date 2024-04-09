# frozen_string_literal: true

require_relative "../../requests"
require "async"

module SeedPackageYmlClient
  class ServiceClient
    attr_reader :request_client

    # @param request_client [SeedPackageYmlClient::RequestClient]
    # @return [SeedPackageYmlClient::ServiceClient]
    def initialize(request_client:)
      # @type [SeedPackageYmlClient::RequestClient]
      @request_client = request_client
    end

    # @param id [String]
    # @param nested_id [String]
    # @param request_options [SeedPackageYmlClient::RequestOptions]
    # @return [Void]
    def nop(id:, nested_id:, request_options: nil)
      @request_client.conn.get("/#{id}/#{nested_id}") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/#{id}/#{nested_id}"
      end
    end
  end

  class AsyncServiceClient
    attr_reader :request_client

    # @param request_client [SeedPackageYmlClient::AsyncRequestClient]
    # @return [SeedPackageYmlClient::AsyncServiceClient]
    def initialize(request_client:)
      # @type [SeedPackageYmlClient::AsyncRequestClient]
      @request_client = request_client
    end

    # @param id [String]
    # @param nested_id [String]
    # @param request_options [SeedPackageYmlClient::RequestOptions]
    # @return [Void]
    def nop(id:, nested_id:, request_options: nil)
      Async do
        @request_client.conn.get("/#{id}/#{nested_id}") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/#{id}/#{nested_id}"
        end
      end
    end
  end
end
