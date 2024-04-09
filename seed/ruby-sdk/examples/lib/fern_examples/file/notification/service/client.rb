# frozen_string_literal: true

require_relative "../../../../requests"
require_relative "../../../types/types/exception"
require "async"

module SeedExamplesClient
  module File
    module Notification
      class ServiceClient
        attr_reader :request_client

        # @param request_client [SeedExamplesClient::RequestClient]
        # @return [SeedExamplesClient::File::Notification::ServiceClient]
        def initialize(request_client:)
          # @type [SeedExamplesClient::RequestClient]
          @request_client = request_client
        end

        # @param notification_id [String]
        # @param request_options [SeedExamplesClient::RequestOptions]
        # @return [SeedExamplesClient::Types::Exception]
        def get_exception(notification_id:, request_options: nil)
          response = @request_client.conn.get("/file/notification/#{notification_id}") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.url "#{@request_client.get_url(request_options: request_options)}/file/notification/#{notification_id}"
          end
          SeedExamplesClient::Types::Exception.from_json(json_object: response.body)
        end
      end

      class AsyncServiceClient
        attr_reader :request_client

        # @param request_client [SeedExamplesClient::AsyncRequestClient]
        # @return [SeedExamplesClient::File::Notification::AsyncServiceClient]
        def initialize(request_client:)
          # @type [SeedExamplesClient::AsyncRequestClient]
          @request_client = request_client
        end

        # @param notification_id [String]
        # @param request_options [SeedExamplesClient::RequestOptions]
        # @return [SeedExamplesClient::Types::Exception]
        def get_exception(notification_id:, request_options: nil)
          Async do
            response = @request_client.conn.get("/file/notification/#{notification_id}") do |req|
              req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
              req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
              req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
              req.url "#{@request_client.get_url(request_options: request_options)}/file/notification/#{notification_id}"
            end
            SeedExamplesClient::Types::Exception.from_json(json_object: response.body)
          end
        end
      end
    end
  end
end
