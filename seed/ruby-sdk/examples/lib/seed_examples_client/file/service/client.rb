# frozen_string_literal: true

require_relative "../../types/types/file"
require "async"

module SeedExamplesClient
  module File
    module Service
      class ServiceClient
        attr_reader :request_client

        # @param request_client [RequestClient]
        # @return [ServiceClient]
        def initialize(request_client:)
          # @type [RequestClient]
          @request_client = request_client
        end

        # @param filename [String]
        # @param request_options [RequestOptions]
        # @return [Types::File]
        def get_file(filename:, request_options: nil)
          response = @request_client.conn.get("/file/#{filename}") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
          end
          Types::File.from_json(json_object: response)
        end
      end

      class AsyncServiceClient
        attr_reader :request_client

        # @param request_client [AsyncRequestClient]
        # @return [AsyncServiceClient]
        def initialize(request_client:)
          # @type [AsyncRequestClient]
          @request_client = request_client
        end

        # @param filename [String]
        # @param request_options [RequestOptions]
        # @return [Types::File]
        def get_file(filename:, request_options: nil)
          Async.call do
            response = @request_client.conn.get("/file/#{filename}") do |req|
              req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
              req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
              req.headers = { **req.headers, **request_options&.additional_headers }.compact
            end
            Types::File.from_json(json_object: response)
          end
        end
      end
    end
  end
end
