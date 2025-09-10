# frozen_string_literal: true

require_relative "../../../requests"
require "async"

module SeedOauthClientCredentialsDefaultClient
  module NestedNoAuth
    class ApiClient
      # @return [SeedOauthClientCredentialsDefaultClient::RequestClient]
      attr_reader :request_client

      # @param request_client [SeedOauthClientCredentialsDefaultClient::RequestClient]
      # @return [SeedOauthClientCredentialsDefaultClient::NestedNoAuth::ApiClient]
      def initialize(request_client:)
        @request_client = request_client
      end

      # @param request_options [SeedOauthClientCredentialsDefaultClient::RequestOptions]
      # @return [Void]
      # @example
      #  oauth_client_credentials_default = SeedOauthClientCredentialsDefaultClient::Client.new(base_url: "https://api.example.com")
      #  oauth_client_credentials_default.nested_no_auth.api.get_something
      def get_something(request_options: nil)
        @request_client.conn.get do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
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
          req.url "#{@request_client.get_url(request_options: request_options)}/nested-no-auth/get-something"
        end
      end
    end

    class AsyncApiClient
      # @return [SeedOauthClientCredentialsDefaultClient::AsyncRequestClient]
      attr_reader :request_client

      # @param request_client [SeedOauthClientCredentialsDefaultClient::AsyncRequestClient]
      # @return [SeedOauthClientCredentialsDefaultClient::NestedNoAuth::AsyncApiClient]
      def initialize(request_client:)
        @request_client = request_client
      end

      # @param request_options [SeedOauthClientCredentialsDefaultClient::RequestOptions]
      # @return [Void]
      # @example
      #  oauth_client_credentials_default = SeedOauthClientCredentialsDefaultClient::Client.new(base_url: "https://api.example.com")
      #  oauth_client_credentials_default.nested_no_auth.api.get_something
      def get_something(request_options: nil)
        Async do
          @request_client.conn.get do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
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
            req.url "#{@request_client.get_url(request_options: request_options)}/nested-no-auth/get-something"
          end
        end
      end
    end
  end
end
