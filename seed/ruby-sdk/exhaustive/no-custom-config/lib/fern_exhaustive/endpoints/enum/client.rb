# frozen_string_literal: true

require_relative "../../../requests"
require_relative "../../types/enum/types/weather_report"
require "json"
require "async"

module SeedExhaustiveClient
  module Endpoints
    class EnumClient
      # @return [SeedExhaustiveClient::RequestClient]
      attr_reader :request_client

      # @param request_client [SeedExhaustiveClient::RequestClient]
      # @return [SeedExhaustiveClient::Endpoints::EnumClient]
      def initialize(request_client:)
        @request_client = request_client
      end

      # @param request [SeedExhaustiveClient::Types::Enum::WeatherReport]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [SeedExhaustiveClient::Types::Enum::WeatherReport]
      # @example
      #  exhaustive = SeedExhaustiveClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
      #  exhaustive.endpoints.enum.get_and_return_enum(request: SUNNY)
      def get_and_return_enum(request:, request_options: nil)
        response = @request_client.conn.post do |req|
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
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/enum"
        end
        JSON.parse(response.body)
      end
    end

    class AsyncEnumClient
      # @return [SeedExhaustiveClient::AsyncRequestClient]
      attr_reader :request_client

      # @param request_client [SeedExhaustiveClient::AsyncRequestClient]
      # @return [SeedExhaustiveClient::Endpoints::AsyncEnumClient]
      def initialize(request_client:)
        @request_client = request_client
      end

      # @param request [SeedExhaustiveClient::Types::Enum::WeatherReport]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [SeedExhaustiveClient::Types::Enum::WeatherReport]
      # @example
      #  exhaustive = SeedExhaustiveClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
      #  exhaustive.endpoints.enum.get_and_return_enum(request: SUNNY)
      def get_and_return_enum(request:, request_options: nil)
        Async do
          response = @request_client.conn.post do |req|
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
            req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
            req.url "#{@request_client.get_url(request_options: request_options)}/enum"
          end
          parsed_json = JSON.parse(response.body)
          parsed_json
        end
      end
    end
  end
end
