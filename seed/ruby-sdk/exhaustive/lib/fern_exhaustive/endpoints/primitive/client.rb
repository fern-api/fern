# frozen_string_literal: true

require_relative "../../../requests"
require "json"
require "date"
require "async"

module SeedExhaustiveClient
  module Endpoints
    class PrimitiveClient
      # @return [SeedExhaustiveClient::RequestClient]
      attr_reader :request_client

      # @param request_client [SeedExhaustiveClient::RequestClient]
      # @return [SeedExhaustiveClient::Endpoints::PrimitiveClient]
      def initialize(request_client:)
        @request_client = request_client
      end

      # @param request [String]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [String]
      def get_and_return_string(request:, request_options: nil)
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/primitive/string"
        end
        JSON.parse(response.body)
      end

      # @param request [Integer]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [Integer]
      def get_and_return_int(request:, request_options: nil)
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/primitive/integer"
        end
        JSON.parse(response.body)
      end

      # @param request [Long]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [Long]
      def get_and_return_long(request:, request_options: nil)
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/primitive/long"
        end
        JSON.parse(response.body)
      end

      # @param request [Float]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [Float]
      def get_and_return_double(request:, request_options: nil)
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/primitive/double"
        end
        JSON.parse(response.body)
      end

      # @param request [Boolean]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [Boolean]
      def get_and_return_bool(request:, request_options: nil)
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/primitive/boolean"
        end
        JSON.parse(response.body)
      end

      # @param request [DateTime]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [DateTime]
      def get_and_return_datetime(request:, request_options: nil)
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/primitive/datetime"
        end
        parsed_json = JSON.parse(response.body)
        return if parsed_json.nil?

        DateTime.parse(parsed_json)
      end

      # @param request [Date]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [Date]
      def get_and_return_date(request:, request_options: nil)
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/primitive/date"
        end
        parsed_json = JSON.parse(response.body)
        return if parsed_json.nil?

        Date.parse(parsed_json)
      end

      # @param request [String]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [String]
      def get_and_return_uuid(request:, request_options: nil)
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/primitive/uuid"
        end
        JSON.parse(response.body)
      end

      # @param request [String]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [String]
      def get_and_return_base_64(request:, request_options: nil)
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/primitive/base64"
        end
        JSON.parse(response.body)
      end
    end

    class AsyncPrimitiveClient
      # @return [SeedExhaustiveClient::AsyncRequestClient]
      attr_reader :request_client

      # @param request_client [SeedExhaustiveClient::AsyncRequestClient]
      # @return [SeedExhaustiveClient::Endpoints::AsyncPrimitiveClient]
      def initialize(request_client:)
        @request_client = request_client
      end

      # @param request [String]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [String]
      def get_and_return_string(request:, request_options: nil)
        Async do
          response = @request_client.conn.post do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
            req.url "#{@request_client.get_url(request_options: request_options)}/primitive/string"
          end
          parsed_json = JSON.parse(response.body)
          parsed_json
        end
      end

      # @param request [Integer]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [Integer]
      def get_and_return_int(request:, request_options: nil)
        Async do
          response = @request_client.conn.post do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
            req.url "#{@request_client.get_url(request_options: request_options)}/primitive/integer"
          end
          parsed_json = JSON.parse(response.body)
          parsed_json
        end
      end

      # @param request [Long]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [Long]
      def get_and_return_long(request:, request_options: nil)
        Async do
          response = @request_client.conn.post do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
            req.url "#{@request_client.get_url(request_options: request_options)}/primitive/long"
          end
          parsed_json = JSON.parse(response.body)
          parsed_json
        end
      end

      # @param request [Float]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [Float]
      def get_and_return_double(request:, request_options: nil)
        Async do
          response = @request_client.conn.post do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
            req.url "#{@request_client.get_url(request_options: request_options)}/primitive/double"
          end
          parsed_json = JSON.parse(response.body)
          parsed_json
        end
      end

      # @param request [Boolean]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [Boolean]
      def get_and_return_bool(request:, request_options: nil)
        Async do
          response = @request_client.conn.post do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
            req.url "#{@request_client.get_url(request_options: request_options)}/primitive/boolean"
          end
          parsed_json = JSON.parse(response.body)
          parsed_json
        end
      end

      # @param request [DateTime]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [DateTime]
      def get_and_return_datetime(request:, request_options: nil)
        Async do
          response = @request_client.conn.post do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
            req.url "#{@request_client.get_url(request_options: request_options)}/primitive/datetime"
          end
          parsed_json = JSON.parse(response.body)
          DateTime.parse(parsed_json) unless parsed_json.nil?
        end
      end

      # @param request [Date]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [Date]
      def get_and_return_date(request:, request_options: nil)
        Async do
          response = @request_client.conn.post do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
            req.url "#{@request_client.get_url(request_options: request_options)}/primitive/date"
          end
          parsed_json = JSON.parse(response.body)
          Date.parse(parsed_json) unless parsed_json.nil?
        end
      end

      # @param request [String]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [String]
      def get_and_return_uuid(request:, request_options: nil)
        Async do
          response = @request_client.conn.post do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
            req.url "#{@request_client.get_url(request_options: request_options)}/primitive/uuid"
          end
          parsed_json = JSON.parse(response.body)
          parsed_json
        end
      end

      # @param request [String]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [String]
      def get_and_return_base_64(request:, request_options: nil)
        Async do
          response = @request_client.conn.post do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
            req.url "#{@request_client.get_url(request_options: request_options)}/primitive/base64"
          end
          parsed_json = JSON.parse(response.body)
          parsed_json
        end
      end
    end
  end
end
