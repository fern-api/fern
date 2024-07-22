# frozen_string_literal: true

require_relative "../../requests"
require "async"

module SeedTraceClient
  module V2
    class V2Client
      # @return [SeedTraceClient::RequestClient]
      attr_reader :request_client

      # @param request_client [SeedTraceClient::RequestClient]
      # @return [SeedTraceClient::V2::V2Client]
      def initialize(request_client:)
        @request_client = request_client
      end

      # @param request_options [SeedTraceClient::RequestOptions]
      # @return [Void]
      # @example
      #  trace = SeedTraceClient::Client.new(
      #    base_url: "https://api.example.com",
      #    environment: SeedTraceClient::Environment::PROD,
      #    token: "YOUR_AUTH_TOKEN"
      #  )
      #  trace.v_2.test
      def test(request_options: nil)
        @request_client.conn.get do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
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
          req.url "#{@request_client.get_url(request_options: request_options)}/"
        end
      end
    end

    class AsyncV2Client
      # @return [SeedTraceClient::AsyncRequestClient]
      attr_reader :request_client

      # @param request_client [SeedTraceClient::AsyncRequestClient]
      # @return [SeedTraceClient::V2::AsyncV2Client]
      def initialize(request_client:)
        @request_client = request_client
      end

      # @param request_options [SeedTraceClient::RequestOptions]
      # @return [Void]
      # @example
      #  trace = SeedTraceClient::Client.new(
      #    base_url: "https://api.example.com",
      #    environment: SeedTraceClient::Environment::PROD,
      #    token: "YOUR_AUTH_TOKEN"
      #  )
      #  trace.v_2.test
      def test(request_options: nil)
        Async do
          @request_client.conn.get do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            unless request_options&.x_random_header.nil?
              req.headers["X-Random-Header"] =
                request_options.x_random_header
            end
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
            req.url "#{@request_client.get_url(request_options: request_options)}/"
          end
        end
      end
    end
  end
end
