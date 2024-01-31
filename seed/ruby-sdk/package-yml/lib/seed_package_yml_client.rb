# frozen_string_literal: true

require "faraday"
require_relative "service/client"
require "async/http/faraday"

module SeedPackageYmlClient
  class Client
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return []
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      request_client = RequestClient.initialize(headers: headers, base_url: base_url, conn: conn)
      @service_client = ServiceClient.initialize(request_client: request_client)
    end

    # @param id [String]
    # @param request [String]
    # @param request_options [RequestOptions]
    # @return [String]
    def echo(id:, request:, request_options: nil)
      request_client.conn.post("/#{id}") do |req|
        req.headers = { **req.headers, **request_options&.additional_headers }.compact
        req.body = { **request, **request_options&.additional_body_parameters }.compact
      end
    end
  end

  class AsyncClient
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return []
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      AsyncRequestClient.initialize(headers: headers, base_url: base_url, conn: conn)
      @async_service_client = AsyncServiceClient.initialize(request_client: request_client)
    end

    # @param id [String]
    # @param request [String]
    # @param request_options [RequestOptions]
    # @return [String]
    def echo(id:, request:, request_options: nil)
      request_client.conn.post("/#{id}") do |req|
        req.headers = { **req.headers, **request_options&.additional_headers }.compact
        req.body = { **request, **request_options&.additional_body_parameters }.compact
      end
    end
  end
end
