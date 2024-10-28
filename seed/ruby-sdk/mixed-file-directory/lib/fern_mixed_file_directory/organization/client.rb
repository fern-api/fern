# frozen_string_literal: true

require_relative "../../requests"
require_relative "types/create_organization_request"
require_relative "types/organization"
require "async"

module SeedMixedFileDirectoryClient
  class OrganizationClient
    # @return [SeedMixedFileDirectoryClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedMixedFileDirectoryClient::RequestClient]
    # @return [SeedMixedFileDirectoryClient::OrganizationClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # Create a new organization.
    #
    # @param request [Hash] Request of type SeedMixedFileDirectoryClient::Organization::CreateOrganizationRequest, as a Hash
    #   * :name (String)
    # @param request_options [SeedMixedFileDirectoryClient::RequestOptions]
    # @return [SeedMixedFileDirectoryClient::Organization::Organization]
    # @example
    #  mixed_file_directory = SeedMixedFileDirectoryClient::Client.new(base_url: "https://api.example.com")
    #  mixed_file_directory.organization.create(request: { name: "name" })
    def create(request:, request_options: nil)
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
        req.url "#{@request_client.get_url(request_options: request_options)}/organizations"
      end
      SeedMixedFileDirectoryClient::Organization::Organization.from_json(json_object: response.body)
    end
  end

  class AsyncOrganizationClient
    # @return [SeedMixedFileDirectoryClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedMixedFileDirectoryClient::AsyncRequestClient]
    # @return [SeedMixedFileDirectoryClient::AsyncOrganizationClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # Create a new organization.
    #
    # @param request [Hash] Request of type SeedMixedFileDirectoryClient::Organization::CreateOrganizationRequest, as a Hash
    #   * :name (String)
    # @param request_options [SeedMixedFileDirectoryClient::RequestOptions]
    # @return [SeedMixedFileDirectoryClient::Organization::Organization]
    # @example
    #  mixed_file_directory = SeedMixedFileDirectoryClient::Client.new(base_url: "https://api.example.com")
    #  mixed_file_directory.organization.create(request: { name: "name" })
    def create(request:, request_options: nil)
      Async do
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
          req.url "#{@request_client.get_url(request_options: request_options)}/organizations"
        end
        SeedMixedFileDirectoryClient::Organization::Organization.from_json(json_object: response.body)
      end
    end
  end
end
