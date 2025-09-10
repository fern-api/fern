# frozen_string_literal: true

require_relative "../../../requests"
require "async"

module SeedInferredAuthImplicitClient
  module Nested
    class ApiClient
      # @return [SeedInferredAuthImplicitClient::RequestClient]
      attr_reader :request_client

      # @param request_client [SeedInferredAuthImplicitClient::RequestClient]
      # @return [SeedInferredAuthImplicitClient::Nested::ApiClient]
      def initialize(request_client:)
        @request_client = request_client
      end

      # @param request_options [SeedInferredAuthImplicitClient::RequestOptions]
      # @return [Void]
      # @example
      #  inferred_auth_implicit = SeedInferredAuthImplicitClient::Client.new(base_url: "https://api.example.com")
      #  inferred_auth_implicit.nested.api.get_something
      def get_something(request_options: nil)
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
          req.url "#{@request_client.get_url(request_options: request_options)}/nested/get-something"
        end
      end
    end

    class AsyncApiClient
      # @return [SeedInferredAuthImplicitClient::AsyncRequestClient]
      attr_reader :request_client

      # @param request_client [SeedInferredAuthImplicitClient::AsyncRequestClient]
      # @return [SeedInferredAuthImplicitClient::Nested::AsyncApiClient]
      def initialize(request_client:)
        @request_client = request_client
      end

      # @param request_options [SeedInferredAuthImplicitClient::RequestOptions]
      # @return [Void]
      # @example
      #  inferred_auth_implicit = SeedInferredAuthImplicitClient::Client.new(base_url: "https://api.example.com")
      #  inferred_auth_implicit.nested.api.get_something
      def get_something(request_options: nil)
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
            req.url "#{@request_client.get_url(request_options: request_options)}/nested/get-something"
          end
        end
      end
    end
  end
end
