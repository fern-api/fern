# frozen_string_literal: true

require "faraday"
require_relative "seed_package_yml_client/service/client"
require "async/http/faraday"

module SeedPackageYmlClient
  class Client
    attr_reader :service_client

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [Client]
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      request_client = RequestClient.new(max_retries: max_retries, timeout_in_seconds: timeout_in_seconds)
      @service_client = Service::ServiceClient.new(request_client: request_client)
    end

    # @param id [String]
    # @param request [String]
    # @param request_options [RequestOptions]
    # @return [String]
    def echo(id:, request:, request_options: nil)
      request_client.conn.post("/#{id}") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
        req.headers = { **req.headers, **request_options&.additional_headers }.compact
        req.body = { **request, **request_options&.additional_body_parameters }.compact
      end
    end
  end

  class AsyncClient
    attr_reader :async_service_client

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [AsyncClient]
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      AsyncRequestClient.new(headers: headers, base_url: base_url, conn: conn)
      @async_service_client = Service::AsyncServiceClient.new(request_client: request_client)
    end

    # @param id [String]
    # @param request [String]
    # @param request_options [RequestOptions]
    # @return [String]
    def echo(id:, request:, request_options: nil)
      request_client.conn.post("/#{id}") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
        req.headers = { **req.headers, **request_options&.additional_headers }.compact
        req.body = { **request, **request_options&.additional_body_parameters }.compact
      end
    end
  end
end
