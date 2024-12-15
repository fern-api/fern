# frozen_string_literal: true

require_relative "../../requests"
require_relative "types/organization"
require_relative "../user/types/user"
require "json"
require "async"

module SeedPathParametersClient
  class OrganizationsClient
    # @return [SeedPathParametersClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedPathParametersClient::RequestClient]
    # @return [SeedPathParametersClient::OrganizationsClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param tenant_id [String]
    # @param organization_id [String]
    # @param request_options [SeedPathParametersClient::RequestOptions]
    # @return [SeedPathParametersClient::Organizations::Organization]
    # @example
    #  path_parameters = SeedPathParametersClient::Client.new(base_url: "https://api.example.com")
    #  path_parameters.organizations.get_organization(tenant_id: "tenantId", organization_id: "organizationId")
    def get_organization(tenant_id:, organization_id:, request_options: nil)
      response = @request_client.conn.get do |req|
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
        req.url "#{@request_client.get_url(request_options: request_options)}/#{tenant_id}/organizations/#{organization_id}"
      end
      SeedPathParametersClient::Organizations::Organization.from_json(json_object: response.body)
    end

    # @param tenant_id [String]
    # @param organization_id [String]
    # @param user_id [String]
    # @param request_options [SeedPathParametersClient::RequestOptions]
    # @return [SeedPathParametersClient::User::User]
    # @example
    #  path_parameters = SeedPathParametersClient::Client.new(base_url: "https://api.example.com")
    #  path_parameters.organizations.get_organization_user(
    #    tenant_id: "tenantId",
    #    organization_id: "organizationId",
    #    user_id: "userId"
    #  )
    def get_organization_user(tenant_id:, organization_id:, user_id:, request_options: nil)
      response = @request_client.conn.get do |req|
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
        req.url "#{@request_client.get_url(request_options: request_options)}/#{tenant_id}/organizations/#{organization_id}/users/#{user_id}"
      end
      SeedPathParametersClient::User::User.from_json(json_object: response.body)
    end

    # @param tenant_id [String]
    # @param organization_id [String]
    # @param limit [Integer]
    # @param request_options [SeedPathParametersClient::RequestOptions]
    # @return [Array<SeedPathParametersClient::Organizations::Organization>]
    # @example
    #  path_parameters = SeedPathParametersClient::Client.new(base_url: "https://api.example.com")
    #  path_parameters.organizations.search_organizations(
    #    tenant_id: "tenantId",
    #    organization_id: "organizationId",
    #    limit: 1
    #  )
    def search_organizations(tenant_id:, organization_id:, limit: nil, request_options: nil)
      response = @request_client.conn.get do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        req.params = { **(request_options&.additional_query_parameters || {}), "limit": limit }.compact
        unless request_options.nil? || request_options&.additional_body_parameters.nil?
          req.body = { **(request_options&.additional_body_parameters || {}) }.compact
        end
        req.url "#{@request_client.get_url(request_options: request_options)}/#{tenant_id}/organizations/#{organization_id}/search"
      end
      parsed_json = JSON.parse(response.body)
      parsed_json&.map do |item|
        item = item.to_json
        SeedPathParametersClient::Organizations::Organization.from_json(json_object: item)
      end
    end
  end

  class AsyncOrganizationsClient
    # @return [SeedPathParametersClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedPathParametersClient::AsyncRequestClient]
    # @return [SeedPathParametersClient::AsyncOrganizationsClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param tenant_id [String]
    # @param organization_id [String]
    # @param request_options [SeedPathParametersClient::RequestOptions]
    # @return [SeedPathParametersClient::Organizations::Organization]
    # @example
    #  path_parameters = SeedPathParametersClient::Client.new(base_url: "https://api.example.com")
    #  path_parameters.organizations.get_organization(tenant_id: "tenantId", organization_id: "organizationId")
    def get_organization(tenant_id:, organization_id:, request_options: nil)
      Async do
        response = @request_client.conn.get do |req|
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
          req.url "#{@request_client.get_url(request_options: request_options)}/#{tenant_id}/organizations/#{organization_id}"
        end
        SeedPathParametersClient::Organizations::Organization.from_json(json_object: response.body)
      end
    end

    # @param tenant_id [String]
    # @param organization_id [String]
    # @param user_id [String]
    # @param request_options [SeedPathParametersClient::RequestOptions]
    # @return [SeedPathParametersClient::User::User]
    # @example
    #  path_parameters = SeedPathParametersClient::Client.new(base_url: "https://api.example.com")
    #  path_parameters.organizations.get_organization_user(
    #    tenant_id: "tenantId",
    #    organization_id: "organizationId",
    #    user_id: "userId"
    #  )
    def get_organization_user(tenant_id:, organization_id:, user_id:, request_options: nil)
      Async do
        response = @request_client.conn.get do |req|
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
          req.url "#{@request_client.get_url(request_options: request_options)}/#{tenant_id}/organizations/#{organization_id}/users/#{user_id}"
        end
        SeedPathParametersClient::User::User.from_json(json_object: response.body)
      end
    end

    # @param tenant_id [String]
    # @param organization_id [String]
    # @param limit [Integer]
    # @param request_options [SeedPathParametersClient::RequestOptions]
    # @return [Array<SeedPathParametersClient::Organizations::Organization>]
    # @example
    #  path_parameters = SeedPathParametersClient::Client.new(base_url: "https://api.example.com")
    #  path_parameters.organizations.search_organizations(
    #    tenant_id: "tenantId",
    #    organization_id: "organizationId",
    #    limit: 1
    #  )
    def search_organizations(tenant_id:, organization_id:, limit: nil, request_options: nil)
      Async do
        response = @request_client.conn.get do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          req.params = { **(request_options&.additional_query_parameters || {}), "limit": limit }.compact
          unless request_options.nil? || request_options&.additional_body_parameters.nil?
            req.body = { **(request_options&.additional_body_parameters || {}) }.compact
          end
          req.url "#{@request_client.get_url(request_options: request_options)}/#{tenant_id}/organizations/#{organization_id}/search"
        end
        parsed_json = JSON.parse(response.body)
        parsed_json&.map do |item|
          item = item.to_json
          SeedPathParametersClient::Organizations::Organization.from_json(json_object: item)
        end
      end
    end
  end
end
