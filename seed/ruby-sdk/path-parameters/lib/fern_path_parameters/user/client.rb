# frozen_string_literal: true

require_relative "../../requests"
require_relative "types/user"
require "async"

module SeedPathParametersClient
  class UserClient
    # @return [SeedPathParametersClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedPathParametersClient::RequestClient]
    # @return [SeedPathParametersClient::UserClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param organization_id [String]
    # @param request_options [SeedPathParametersClient::RequestOptions]
    # @return [SeedPathParametersClient::User::User]
    # @example
    #  path_parameters = SeedPathParametersClient::Client.new(base_url: "https://api.example.com")
    #  path_parameters.user.get_organization(organization_id: "organizationId")
    def get_organization(organization_id:, request_options: nil)
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
        req.url "#{@request_client.get_url(request_options: request_options)}/user/organizations/#{organization_id}"
      end
      SeedPathParametersClient::User::User.from_json(json_object: response.body)
    end

    # @param user_id [String]
    # @param request_options [SeedPathParametersClient::RequestOptions]
    # @return [SeedPathParametersClient::User::User]
    # @example
    #  path_parameters = SeedPathParametersClient::Client.new(base_url: "https://api.example.com")
    #  path_parameters.user.get_user(user_id: "userId")
    def get_user(user_id:, request_options: nil)
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
        req.url "#{@request_client.get_url(request_options: request_options)}/user/users/#{user_id}"
      end
      SeedPathParametersClient::User::User.from_json(json_object: response.body)
    end

    # @param organization_id [String]
    # @param user_id [String]
    # @param request_options [SeedPathParametersClient::RequestOptions]
    # @return [SeedPathParametersClient::User::User]
    # @example
    #  path_parameters = SeedPathParametersClient::Client.new(base_url: "https://api.example.com")
    #  path_parameters.user.get_organization_user(organization_id: "organizationId", user_id: "userId")
    def get_organization_user(organization_id:, user_id:, request_options: nil)
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
        req.url "#{@request_client.get_url(request_options: request_options)}/user/organizations/#{organization_id}/users/#{user_id}"
      end
      SeedPathParametersClient::User::User.from_json(json_object: response.body)
    end
  end

  class AsyncUserClient
    # @return [SeedPathParametersClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedPathParametersClient::AsyncRequestClient]
    # @return [SeedPathParametersClient::AsyncUserClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param organization_id [String]
    # @param request_options [SeedPathParametersClient::RequestOptions]
    # @return [SeedPathParametersClient::User::User]
    # @example
    #  path_parameters = SeedPathParametersClient::Client.new(base_url: "https://api.example.com")
    #  path_parameters.user.get_organization(organization_id: "organizationId")
    def get_organization(organization_id:, request_options: nil)
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
          req.url "#{@request_client.get_url(request_options: request_options)}/user/organizations/#{organization_id}"
        end
        SeedPathParametersClient::User::User.from_json(json_object: response.body)
      end
    end

    # @param user_id [String]
    # @param request_options [SeedPathParametersClient::RequestOptions]
    # @return [SeedPathParametersClient::User::User]
    # @example
    #  path_parameters = SeedPathParametersClient::Client.new(base_url: "https://api.example.com")
    #  path_parameters.user.get_user(user_id: "userId")
    def get_user(user_id:, request_options: nil)
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
          req.url "#{@request_client.get_url(request_options: request_options)}/user/users/#{user_id}"
        end
        SeedPathParametersClient::User::User.from_json(json_object: response.body)
      end
    end

    # @param organization_id [String]
    # @param user_id [String]
    # @param request_options [SeedPathParametersClient::RequestOptions]
    # @return [SeedPathParametersClient::User::User]
    # @example
    #  path_parameters = SeedPathParametersClient::Client.new(base_url: "https://api.example.com")
    #  path_parameters.user.get_organization_user(organization_id: "organizationId", user_id: "userId")
    def get_organization_user(organization_id:, user_id:, request_options: nil)
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
          req.url "#{@request_client.get_url(request_options: request_options)}/user/organizations/#{organization_id}/users/#{user_id}"
        end
        SeedPathParametersClient::User::User.from_json(json_object: response.body)
      end
    end
  end
end
