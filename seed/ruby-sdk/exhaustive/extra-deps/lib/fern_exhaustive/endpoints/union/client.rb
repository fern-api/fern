# frozen_string_literal: true

require_relative "../../../requests"
require_relative "../../types/union/types/animal"
require "async"

module SeedExhaustiveClient
  module Endpoints
    class UnionClient
      # @return [SeedExhaustiveClient::RequestClient]
      attr_reader :request_client

      # @param request_client [SeedExhaustiveClient::RequestClient]
      # @return [SeedExhaustiveClient::Endpoints::UnionClient]
      def initialize(request_client:)
        @request_client = request_client
      end

      # @param request [SeedExhaustiveClient::Types::Union::Animal]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [SeedExhaustiveClient::Types::Union::Animal]
      # @example
      #  exhaustive = SeedExhaustiveClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
      #  exhaustive.endpoints.union.get_and_return_union
      def get_and_return_union(request:, request_options: nil)
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
          req.url "#{@request_client.get_url(request_options: request_options)}/union"
        end
        SeedExhaustiveClient::Types::Union::Animal.from_json(json_object: response.body)
      end
    end

    class AsyncUnionClient
      # @return [SeedExhaustiveClient::AsyncRequestClient]
      attr_reader :request_client

      # @param request_client [SeedExhaustiveClient::AsyncRequestClient]
      # @return [SeedExhaustiveClient::Endpoints::AsyncUnionClient]
      def initialize(request_client:)
        @request_client = request_client
      end

      # @param request [SeedExhaustiveClient::Types::Union::Animal]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [SeedExhaustiveClient::Types::Union::Animal]
      # @example
      #  exhaustive = SeedExhaustiveClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
      #  exhaustive.endpoints.union.get_and_return_union
      def get_and_return_union(request:, request_options: nil)
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
            req.url "#{@request_client.get_url(request_options: request_options)}/union"
          end
          SeedExhaustiveClient::Types::Union::Animal.from_json(json_object: response.body)
        end
      end
    end
  end
end
