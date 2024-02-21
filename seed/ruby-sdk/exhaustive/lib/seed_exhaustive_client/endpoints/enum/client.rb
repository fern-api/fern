# frozen_string_literal: true

require_relative "../../../requests"
require_relative "../../types/enum/types/weather_report"
require "async"

module SeedExhaustiveClient
  module Endpoints
    class EnumClient
      attr_reader :request_client

      # @param request_client [RequestClient]
      # @return [Endpoints::EnumClient]
      def initialize(request_client:)
        # @type [RequestClient]
        @request_client = request_client
      end

      # @param request [Types::Enum::WeatherReport]
      # @param request_options [RequestOptions]
      # @return [Types::Enum::WeatherReport]
      def get_and_return_enum(request:, request_options: nil)
        response = @request_client.conn.post("/enum") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        end
        response.body
      end
    end

    class AsyncEnumClient
      attr_reader :request_client

      # @param request_client [AsyncRequestClient]
      # @return [Endpoints::AsyncEnumClient]
      def initialize(request_client:)
        # @type [AsyncRequestClient]
        @request_client = request_client
      end

      # @param request [Types::Enum::WeatherReport]
      # @param request_options [RequestOptions]
      # @return [Types::Enum::WeatherReport]
      def get_and_return_enum(request:, request_options: nil)
        Async do
          response = @request_client.conn.post("/enum") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          end
          response.body
        end
      end
    end
  end
end
