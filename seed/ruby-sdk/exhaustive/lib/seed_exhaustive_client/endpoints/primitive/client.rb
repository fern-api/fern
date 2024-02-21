# frozen_string_literal: true

require_relative "../../../requests"
require "date"
require "async"

module SeedExhaustiveClient
  module Endpoints
    class PrimitiveClient
      attr_reader :request_client

      # @param request_client [RequestClient]
      # @return [Endpoints::PrimitiveClient]
      def initialize(request_client:)
        # @type [RequestClient]
        @request_client = request_client
      end

      # @param request [String]
      # @param request_options [RequestOptions]
      # @return [String]
      def get_and_return_string(request:, request_options: nil)
        response = @request_client.conn.post("/primitive/string") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        end
        response.body
      end

      # @param request [Integer]
      # @param request_options [RequestOptions]
      # @return [Integer]
      def get_and_return_int(request:, request_options: nil)
        response = @request_client.conn.post("/primitive/integer") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        end
        response.body
      end

      # @param request [Long]
      # @param request_options [RequestOptions]
      # @return [Long]
      def get_and_return_long(request:, request_options: nil)
        response = @request_client.conn.post("/primitive/long") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        end
        response.body
      end

      # @param request [Float]
      # @param request_options [RequestOptions]
      # @return [Float]
      def get_and_return_double(request:, request_options: nil)
        response = @request_client.conn.post("/primitive/double") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        end
        response.body
      end

      # @param request [Boolean]
      # @param request_options [RequestOptions]
      # @return [Boolean]
      def get_and_return_bool(request:, request_options: nil)
        response = @request_client.conn.post("/primitive/boolean") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        end
        response.body
      end

      # @param request [DateTime]
      # @param request_options [RequestOptions]
      # @return [DateTime]
      def get_and_return_datetime(request:, request_options: nil)
        response = @request_client.conn.post("/primitive/datetime") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        end
        return if response.body.nil?

        DateTime.parse(response.body)
      end

      # @param request [Date]
      # @param request_options [RequestOptions]
      # @return [Date]
      def get_and_return_date(request:, request_options: nil)
        response = @request_client.conn.post("/primitive/date") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        end
        return if response.body.nil?

        Date.parse(response.body)
      end

      # @param request [UUID]
      # @param request_options [RequestOptions]
      # @return [UUID]
      def get_and_return_uuid(request:, request_options: nil)
        response = @request_client.conn.post("/primitive/uuid") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        end
        response.body
      end

      # @param request [String]
      # @param request_options [RequestOptions]
      # @return [String]
      def get_and_return_base_64(request:, request_options: nil)
        response = @request_client.conn.post("/primitive/base64") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        end
        response.body
      end
    end

    class AsyncPrimitiveClient
      attr_reader :request_client

      # @param request_client [AsyncRequestClient]
      # @return [Endpoints::AsyncPrimitiveClient]
      def initialize(request_client:)
        # @type [AsyncRequestClient]
        @request_client = request_client
      end

      # @param request [String]
      # @param request_options [RequestOptions]
      # @return [String]
      def get_and_return_string(request:, request_options: nil)
        Async do
          response = @request_client.conn.post("/primitive/string") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          end
          response.body
        end
      end

      # @param request [Integer]
      # @param request_options [RequestOptions]
      # @return [Integer]
      def get_and_return_int(request:, request_options: nil)
        Async do
          response = @request_client.conn.post("/primitive/integer") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          end
          response.body
        end
      end

      # @param request [Long]
      # @param request_options [RequestOptions]
      # @return [Long]
      def get_and_return_long(request:, request_options: nil)
        Async do
          response = @request_client.conn.post("/primitive/long") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          end
          response.body
        end
      end

      # @param request [Float]
      # @param request_options [RequestOptions]
      # @return [Float]
      def get_and_return_double(request:, request_options: nil)
        Async do
          response = @request_client.conn.post("/primitive/double") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          end
          response.body
        end
      end

      # @param request [Boolean]
      # @param request_options [RequestOptions]
      # @return [Boolean]
      def get_and_return_bool(request:, request_options: nil)
        Async do
          response = @request_client.conn.post("/primitive/boolean") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          end
          response.body
        end
      end

      # @param request [DateTime]
      # @param request_options [RequestOptions]
      # @return [DateTime]
      def get_and_return_datetime(request:, request_options: nil)
        Async do
          response = @request_client.conn.post("/primitive/datetime") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          end
          DateTime.parse(response.body) unless response.body.nil?
        end
      end

      # @param request [Date]
      # @param request_options [RequestOptions]
      # @return [Date]
      def get_and_return_date(request:, request_options: nil)
        Async do
          response = @request_client.conn.post("/primitive/date") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          end
          Date.parse(response.body) unless response.body.nil?
        end
      end

      # @param request [UUID]
      # @param request_options [RequestOptions]
      # @return [UUID]
      def get_and_return_uuid(request:, request_options: nil)
        Async do
          response = @request_client.conn.post("/primitive/uuid") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          end
          response.body
        end
      end

      # @param request [String]
      # @param request_options [RequestOptions]
      # @return [String]
      def get_and_return_base_64(request:, request_options: nil)
        Async do
          response = @request_client.conn.post("/primitive/base64") do |req|
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
