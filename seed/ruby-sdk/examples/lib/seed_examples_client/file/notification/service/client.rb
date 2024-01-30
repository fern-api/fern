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
          # @return [ServiceClient]
          def initialize(request_client:)
            # @type [RequestClient]
            @request_client = request_client
          end

          # @param notification_id [String]
          # @param request_options [RequestOptions]
          # @return [Types::Exception]
          def get_exception(notification_id:, request_options: nil)
            response = @request_client.conn.get("/file/notification/#{notification_id}") do |req|
              req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
            end
            Types::Exception.from_json(json_object: response)
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

          # @param notification_id [String]
          # @param request_options [RequestOptions]
          # @return [Types::Exception]
          def get_exception(notification_id:, request_options: nil)
            Async.call do
              response = @request_client.conn.get("/file/notification/#{notification_id}") do |req|
                req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
              end
              Types::Exception.from_json(json_object: response)
            end
          end
        end
      end
    end
  end
end
