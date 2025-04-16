# frozen_string_literal: true

require_relative "../../../requests"
require_relative "types/put_response"
require "async"

module SeedExhaustiveClient
  module Endpoints
    class PutClient
      # @return [SeedExhaustiveClient::RequestClient]
      attr_reader :request_client

      # @param request_client [SeedExhaustiveClient::RequestClient]
      # @return [SeedExhaustiveClient::Endpoints::PutClient]
      def initialize(request_client:)
        @request_client = request_client
      end

      # @param id [String]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [SeedExhaustiveClient::Endpoints::Put::PutResponse]
      # @example
      #  exhaustive = SeedExhaustiveClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
      #  exhaustive.endpoints.put.add(id: "id")
      def add(id:, request_options: nil)
        response = @request_client.conn.put do |req|
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
          req.url "#{@request_client.get_url(request_options: request_options)}/#{id}"
        end
        SeedExhaustiveClient::Endpoints::Put::PutResponse.from_json(json_object: response.body)
      end
    end

    class AsyncPutClient
      # @return [SeedExhaustiveClient::AsyncRequestClient]
      attr_reader :request_client

      # @param request_client [SeedExhaustiveClient::AsyncRequestClient]
      # @return [SeedExhaustiveClient::Endpoints::AsyncPutClient]
      def initialize(request_client:)
        @request_client = request_client
      end

      # @param id [String]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [SeedExhaustiveClient::Endpoints::Put::PutResponse]
      # @example
      #  exhaustive = SeedExhaustiveClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
      #  exhaustive.endpoints.put.add(id: "id")
      def add(id:, request_options: nil)
        Async do
          response = @request_client.conn.put do |req|
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
            req.url "#{@request_client.get_url(request_options: request_options)}/#{id}"
          end
          SeedExhaustiveClient::Endpoints::Put::PutResponse.from_json(json_object: response.body)
        end
      end
    end
  end
end
