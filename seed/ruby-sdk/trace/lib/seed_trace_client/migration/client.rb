# frozen_string_literal: true

require_relative "types/migration"
require "async"

module SeedTraceClient
  module Migration
    class MigrationClient
      attr_reader :request_client

      # @param request_client [RequestClient]
      # @return [MigrationClient]
      def initialize(request_client:)
        # @type [RequestClient]
        @request_client = request_client
      end

      # @param admin_key_header [String]
      # @param request_options [RequestOptions]
      # @return [Array<Migration::Migration>]
      def get_attempted_migrations(admin_key_header:, request_options: nil)
        response = @request_client.conn.get("/migration-info/all") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
          req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
          req.headers["X-Random-Header"] = @request_client.x_random_header if @request_client.x_random_header.nil?
          req.headers = {
            **req.headers,
            **request_options&.additional_headers,
            "admin-key-header": admin_key_header
          }.compact
        end
        response.map do |v|
          v = v.to_h.to_json
          Migration::Migration.from_json(json_object: v)
        end
      end
    end

    class AsyncMigrationClient
      attr_reader :request_client

      # @param request_client [AsyncRequestClient]
      # @return [AsyncMigrationClient]
      def initialize(request_client:)
        # @type [AsyncRequestClient]
        @request_client = request_client
      end

      # @param admin_key_header [String]
      # @param request_options [RequestOptions]
      # @return [Array<Migration::Migration>]
      def get_attempted_migrations(admin_key_header:, request_options: nil)
        Async.call do
          response = @request_client.conn.get("/migration-info/all") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
            req.headers["X-Random-Header"] = @request_client.x_random_header if @request_client.x_random_header.nil?
            req.headers = {
              **req.headers,
              **request_options&.additional_headers,
              "admin-key-header": admin_key_header
            }.compact
          end
          response.map do |v|
            v = v.to_h.to_json
            Migration::Migration.from_json(json_object: v)
          end
        end
      end
    end
  end
end
