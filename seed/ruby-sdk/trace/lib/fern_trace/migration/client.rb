# frozen_string_literal: true

require_relative "../../requests"
require_relative "types/migration"
require "json"
require "async"

module SeedTraceClient
  class MigrationClient
    # @return [SeedTraceClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedTraceClient::RequestClient]
    # @return [SeedTraceClient::MigrationClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param admin_key_header [String]
    # @param request_options [SeedTraceClient::RequestOptions]
    # @return [Array<SeedTraceClient::Migration::Migration>]
    # @example
    #  trace = SeedTraceClient::Client.new(
    #    base_url: "https://api.example.com",
    #    environment: SeedTraceClient::Environment::PROD,
    #    token: "YOUR_AUTH_TOKEN"
    #  )
    #  trace.migration.get_attempted_migrations(admin_key_header: "admin-key-header")
    def get_attempted_migrations(admin_key_header:, request_options: nil)
      response = @request_client.conn.get do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
        req.headers = {
          **(req.headers || {}),
          **@request_client.get_headers,
          **(request_options&.additional_headers || {}),
          "admin-key-header": admin_key_header
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        unless request_options.nil? || request_options&.additional_body_parameters.nil?
          req.body = { **(request_options&.additional_body_parameters || {}) }.compact
        end
        req.url "#{@request_client.get_url(request_options: request_options)}/migration-info/all"
      end
      parsed_json = JSON.parse(response.body)
      parsed_json&.map do |item|
        item = item.to_json
        SeedTraceClient::Migration::Migration.from_json(json_object: item)
      end
    end
  end

  class AsyncMigrationClient
    # @return [SeedTraceClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedTraceClient::AsyncRequestClient]
    # @return [SeedTraceClient::AsyncMigrationClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param admin_key_header [String]
    # @param request_options [SeedTraceClient::RequestOptions]
    # @return [Array<SeedTraceClient::Migration::Migration>]
    # @example
    #  trace = SeedTraceClient::Client.new(
    #    base_url: "https://api.example.com",
    #    environment: SeedTraceClient::Environment::PROD,
    #    token: "YOUR_AUTH_TOKEN"
    #  )
    #  trace.migration.get_attempted_migrations(admin_key_header: "admin-key-header")
    def get_attempted_migrations(admin_key_header:, request_options: nil)
      Async do
        response = @request_client.conn.get do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
          req.headers = {
            **(req.headers || {}),
            **@request_client.get_headers,
            **(request_options&.additional_headers || {}),
            "admin-key-header": admin_key_header
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          unless request_options.nil? || request_options&.additional_body_parameters.nil?
            req.body = { **(request_options&.additional_body_parameters || {}) }.compact
          end
          req.url "#{@request_client.get_url(request_options: request_options)}/migration-info/all"
        end
        parsed_json = JSON.parse(response.body)
        parsed_json&.map do |item|
          item = item.to_json
          SeedTraceClient::Migration::Migration.from_json(json_object: item)
        end
      end
    end
  end
end
