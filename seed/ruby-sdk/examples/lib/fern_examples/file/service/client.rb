# frozen_string_literal: true

require_relative "../../../requests"
require_relative "../../types/types/file"
require "async"

module SeedExamplesClient
  module File
    class ServiceClient
      attr_reader :request_client

      # @param request_client [SeedExamplesClient::RequestClient]
      # @return [SeedExamplesClient::File::ServiceClient]
      def initialize(request_client:)
        # @type [SeedExamplesClient::RequestClient]
        @request_client = request_client
      end

      # This endpoint returns a file by its name.
      #
      # @param filename [String] This is a filename
      # @param request_options [SeedExamplesClient::RequestOptions]
      # @return [SeedExamplesClient::Types::File]
      def get_file(filename:, request_options: nil)
        response = @request_client.conn.get("/file/#{filename}") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/file/#{filename}"
        end
        SeedExamplesClient::Types::File.from_json(json_object: response.body)
      end
    end

    class AsyncServiceClient
      attr_reader :request_client

      # @param request_client [SeedExamplesClient::AsyncRequestClient]
      # @return [SeedExamplesClient::File::AsyncServiceClient]
      def initialize(request_client:)
        # @type [SeedExamplesClient::AsyncRequestClient]
        @request_client = request_client
      end

      # This endpoint returns a file by its name.
      #
      # @param filename [String] This is a filename
      # @param request_options [SeedExamplesClient::RequestOptions]
      # @return [SeedExamplesClient::Types::File]
      def get_file(filename:, request_options: nil)
        Async do
          response = @request_client.conn.get("/file/#{filename}") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.url "#{@request_client.get_url(request_options: request_options)}/file/#{filename}"
          end
          SeedExamplesClient::Types::File.from_json(json_object: response.body)
        end
      end
    end
  end
end
