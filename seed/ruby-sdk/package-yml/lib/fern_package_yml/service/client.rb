# frozen_string_literal: true

require_relative "../../requests"
require "async"

module SeedPackageYmlClient
  class ServiceClient
    # @return [SeedPackageYmlClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedPackageYmlClient::RequestClient]
    # @return [SeedPackageYmlClient::ServiceClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param id [String]
    # @param nested_id [String]
    # @param request_options [SeedPackageYmlClient::RequestOptions]
    # @return [Void]
    # @example
    #  package_yml = SeedPackageYmlClient::Client.new(base_url: "https://api.example.com")
    #  package_yml.service.nop(id: "id-a2ijs82", nested_id: "id-219xca8")
    def nop(id:, nested_id:, request_options: nil)
      @request_client.conn.get do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        unless request_options.nil? || request_options&.additional_body_parameters.nil?
          req.body = { **(request_options&.additional_body_parameters || {}) }.compact
        end
        req.url "#{@request_client.get_url(request_options: request_options)}/#{id}/#{nested_id}"
      end
    end
  end

  class AsyncServiceClient
    # @return [SeedPackageYmlClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedPackageYmlClient::AsyncRequestClient]
    # @return [SeedPackageYmlClient::AsyncServiceClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param id [String]
    # @param nested_id [String]
    # @param request_options [SeedPackageYmlClient::RequestOptions]
    # @return [Void]
    # @example
    #  package_yml = SeedPackageYmlClient::Client.new(base_url: "https://api.example.com")
    #  package_yml.service.nop(id: "id-a2ijs82", nested_id: "id-219xca8")
    def nop(id:, nested_id:, request_options: nil)
      Async do
        @request_client.conn.get do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          unless request_options.nil? || request_options&.additional_body_parameters.nil?
            req.body = { **(request_options&.additional_body_parameters || {}) }.compact
          end
          req.url "#{@request_client.get_url(request_options: request_options)}/#{id}/#{nested_id}"
        end
      end
    end
  end
end
