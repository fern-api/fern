# frozen_string_literal: true

require_relative "../../../requests"
require "json"
require "async"

module SeedExhaustiveClient
  module Endpoints
    class ParamsClient
      # @return [SeedExhaustiveClient::RequestClient]
      attr_reader :request_client

      # @param request_client [SeedExhaustiveClient::RequestClient]
      # @return [SeedExhaustiveClient::Endpoints::ParamsClient]
      def initialize(request_client:)
        @request_client = request_client
      end

      # GET with path param
      #
      # @param param [String]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [String]
      def get_with_path(param:, request_options: nil)
        response = @request_client.conn.get do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/params/path/#{param}"
        end
        JSON.parse(response.body)
      end

      # GET with query param
      #
      # @param query [String]
      # @param number [Integer]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [Void]
      def get_with_query(query:, number:, request_options: nil)
        @request_client.conn.get do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.params = {
            **(request_options&.additional_query_parameters || {}),
            "query": query,
            "number": number
          }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/params"
        end
      end

      # GET with multiple of same query param
      #
      # @param query [String]
      # @param numer [Integer]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [Void]
      def get_with_allow_multiple_query(query:, numer:, request_options: nil)
        @request_client.conn.get do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.params = {
            **(request_options&.additional_query_parameters || {}),
            "query": query,
            "numer": numer
          }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/params"
        end
      end

      # GET with path and query params
      #
      # @param param [String]
      # @param query [String]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [Void]
      def get_with_path_and_query(param:, query:, request_options: nil)
        @request_client.conn.get do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.params = { **(request_options&.additional_query_parameters || {}), "query": query }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/params/path-query/#{param}"
        end
      end

      # PUT to update with path param
      #
      # @param param [String]
      # @param request [String]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [String]
      def modify_with_path(param:, request:, request_options: nil)
        response = @request_client.conn.put do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/params/path/#{param}"
        end
        JSON.parse(response.body)
      end
    end

    class AsyncParamsClient
      # @return [SeedExhaustiveClient::AsyncRequestClient]
      attr_reader :request_client

      # @param request_client [SeedExhaustiveClient::AsyncRequestClient]
      # @return [SeedExhaustiveClient::Endpoints::AsyncParamsClient]
      def initialize(request_client:)
        @request_client = request_client
      end

      # GET with path param
      #
      # @param param [String]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [String]
      def get_with_path(param:, request_options: nil)
        Async do
          response = @request_client.conn.get do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.url "#{@request_client.get_url(request_options: request_options)}/params/path/#{param}"
          end
          parsed_json = JSON.parse(response.body)
          parsed_json
        end
      end

      # GET with query param
      #
      # @param query [String]
      # @param number [Integer]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [Void]
      def get_with_query(query:, number:, request_options: nil)
        Async do
          @request_client.conn.get do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.params = {
              **(request_options&.additional_query_parameters || {}),
              "query": query,
              "number": number
            }.compact
            req.url "#{@request_client.get_url(request_options: request_options)}/params"
          end
        end
      end

      # GET with multiple of same query param
      #
      # @param query [String]
      # @param numer [Integer]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [Void]
      def get_with_allow_multiple_query(query:, numer:, request_options: nil)
        Async do
          @request_client.conn.get do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.params = {
              **(request_options&.additional_query_parameters || {}),
              "query": query,
              "numer": numer
            }.compact
            req.url "#{@request_client.get_url(request_options: request_options)}/params"
          end
        end
      end

      # GET with path and query params
      #
      # @param param [String]
      # @param query [String]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [Void]
      def get_with_path_and_query(param:, query:, request_options: nil)
        Async do
          @request_client.conn.get do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.params = { **(request_options&.additional_query_parameters || {}), "query": query }.compact
            req.url "#{@request_client.get_url(request_options: request_options)}/params/path-query/#{param}"
          end
        end
      end

      # PUT to update with path param
      #
      # @param param [String]
      # @param request [String]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [String]
      def modify_with_path(param:, request:, request_options: nil)
        Async do
          response = @request_client.conn.put do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
            req.url "#{@request_client.get_url(request_options: request_options)}/params/path/#{param}"
          end
          parsed_json = JSON.parse(response.body)
          parsed_json
        end
      end
    end
  end
end
