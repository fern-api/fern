# frozen_string_literal: true

require_relative "../../../requests"
require_relative "../../types/types/file"
require "async"

module SeedExamplesClient
  module File
    class ServiceClient
      # @return [SeedExamplesClient::RequestClient]
      attr_reader :request_client

      # @param request_client [SeedExamplesClient::RequestClient]
      # @return [SeedExamplesClient::File::ServiceClient]
      def initialize(request_client:)
        @request_client = request_client
      end

      # This endpoint returns a file by its name.
      #
      # @param filename [String] This is a filename
      # @param request_options [SeedExamplesClient::RequestOptions]
      # @return [SeedExamplesClient::Types::File]
      # @example
      #  examples = SeedExamplesClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
      #  examples.file.service.get_file(filename: "file.txt")
      def get_file(filename:, request_options: nil)
        response = @request_client.conn.get do |req|
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
          req.url "#{@request_client.get_url(request_options: request_options)}/file/#{filename}"
        end
        SeedExamplesClient::Types::File.from_json(json_object: response.body)
      end
    end

    class AsyncServiceClient
      # @return [SeedExamplesClient::AsyncRequestClient]
      attr_reader :request_client

      # @param request_client [SeedExamplesClient::AsyncRequestClient]
      # @return [SeedExamplesClient::File::AsyncServiceClient]
      def initialize(request_client:)
        @request_client = request_client
      end

      # This endpoint returns a file by its name.
      #
      # @param filename [String] This is a filename
      # @param request_options [SeedExamplesClient::RequestOptions]
      # @return [SeedExamplesClient::Types::File]
      # @example
      #  examples = SeedExamplesClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
      #  examples.file.service.get_file(filename: "file.txt")
      def get_file(filename:, request_options: nil)
        Async do
          response = @request_client.conn.get do |req|
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
            req.url "#{@request_client.get_url(request_options: request_options)}/file/#{filename}"
          end
          SeedExamplesClient::Types::File.from_json(json_object: response.body)
        end
      end
    end
  end
end
