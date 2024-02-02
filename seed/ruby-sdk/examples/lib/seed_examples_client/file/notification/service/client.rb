# frozen_string_literal: true

require_relative "../../../types/types/exception"
require "async"

module SeedExamplesClient
  module File
    module Notification
      module Service
        class ServiceClient
          attr_reader :request_client

          # @param request_client [RequestClient]
          # @return [File::Notification::Service::ServiceClient]
          def initialize(request_client:)
            # @type [RequestClient]
            @request_client = request_client
          end

          # @param notification_id [String]
          # @param request_options [RequestOptions]
          # @return [Types::Exception]
          def get_exception(notification_id:, request_options: nil)
            response = @request_client.conn.get("/file/notification/#{notification_id}") do |req|
              req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
              req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
              req.headers = { **req.headers, **request_options&.additional_headers }.compact
            end
            Types::Exception.from_json(json_object: response)
          end
        end

        class AsyncServiceClient
          attr_reader :request_client

          # @param request_client [AsyncRequestClient]
          # @return [File::Notification::Service::AsyncServiceClient]
          def initialize(request_client:)
            # @type [AsyncRequestClient]
            @request_client = request_client
          end

          # @param notification_id [String]
          # @param request_options [RequestOptions]
          # @return [Types::Exception]
          def get_exception(notification_id:, request_options: nil)
            Async.call do
              response = @request_client.conn.get("/file/notification/#{notification_id}") do |req|
                req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
                req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
                req.headers = { **req.headers, **request_options&.additional_headers }.compact
              end
              Types::Exception.from_json(json_object: response)
            end
          end
        end
      end
    end
  end
end
