# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require_relative "fern_package_yml/service/client"
require_relative "fern_package_yml/types/echo_request"
require "json"

module SeedPackageYmlClient
  class Client
    # @return [SeedPackageYmlClient::ServiceClient]
    attr_reader :service

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedPackageYmlClient::Client]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @request_client = SeedPackageYmlClient::RequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @service = SeedPackageYmlClient::ServiceClient.new(request_client: @request_client)
    end

    # @param id [String]
    # @param request [Hash] Request of type SeedPackageYmlClient::EchoRequest, as a Hash
    #   * :name (String)
    #   * :size (Integer)
    # @param request_options [SeedPackageYmlClient::RequestOptions]
    # @return [String]
    # @example
    #  package_yml = SeedPackageYmlClient::Client.new(base_url: "https://api.example.com")
    #  package_yml.echo(id: "id-ksfd9c1", request: { name: "Hello world!", size: 20 })
    def echo(id:, request:, request_options: nil)
      response = @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/#{id}"
      end
      JSON.parse(response.body)
    end
  end

  class AsyncClient
    # @return [SeedPackageYmlClient::AsyncServiceClient]
    attr_reader :service

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedPackageYmlClient::AsyncClient]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = SeedPackageYmlClient::AsyncRequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @service = SeedPackageYmlClient::AsyncServiceClient.new(request_client: @async_request_client)
    end

    # @param id [String]
    # @param request [Hash] Request of type SeedPackageYmlClient::EchoRequest, as a Hash
    #   * :name (String)
    #   * :size (Integer)
    # @param request_options [SeedPackageYmlClient::RequestOptions]
    # @return [String]
    # @example
    #  package_yml = SeedPackageYmlClient::Client.new(base_url: "https://api.example.com")
    #  package_yml.echo(id: "id-ksfd9c1", request: { name: "Hello world!", size: 20 })
    def echo(id:, request:, request_options: nil)
      response = @async_request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = {
      **(req.headers || {}),
      **@async_request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        req.url "#{@async_request_client.get_url(request_options: request_options)}/#{id}"
      end
      JSON.parse(response.body)
    end
  end
end
