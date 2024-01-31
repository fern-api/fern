# frozen_string_literal: true

require "async"

module SeedExhaustiveClient
  module Endpoints
    module Enum
      class EnumClient
        attr_reader :request_client

        # @param request_client [RequestClient]
        # @return [EnumClient]
        def initialize(request_client:)
          # @type [RequestClient]
          @request_client = request_client
        end

        # @param request [Hash{String => String}]
        # @param request_options [RequestOptions]
        # @return [Hash{String => String}]
        def get_and_return_enum(request:, request_options: nil)
          response = @request_client.conn.post("/enum") do |req|
            req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
            req.body = { **request, **request_options&.additional_body_parameters }.compact
          end
          WEATHER_REPORT.key(response)
        end
      end

      class AsyncEnumClient
        attr_reader :request_client

        # @param request_client [AsyncRequestClient]
        # @return [AsyncEnumClient]
        def initialize(request_client:)
          # @type [AsyncRequestClient]
          @request_client = request_client
        end

        # @param request [Hash{String => String}]
        # @param request_options [RequestOptions]
        # @return [Hash{String => String}]
        def get_and_return_enum(request:, request_options: nil)
          Async.call do
            response = @request_client.conn.post("/enum") do |req|
              req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
              req.headers = { **req.headers, **request_options&.additional_headers }.compact
              req.body = { **request, **request_options&.additional_body_parameters }.compact
            end
            WEATHER_REPORT.key(response)
          end
        end
      end
    end
  end
end
