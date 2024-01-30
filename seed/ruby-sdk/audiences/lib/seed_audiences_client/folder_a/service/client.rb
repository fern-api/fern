# frozen_string_literal: true

require_relative "types/response"
require "async"

module SeedAudiencesClient
  module FolderA
    module Service
      class ServiceClient
        attr_reader :request_client

        # @param request_client [RequestClient]
        # @return [ServiceClient]
        def initialize(request_client:)
          # @type [RequestClient]
          @request_client = request_client
        end

        # @param request_options [RequestOptions]
        # @return [FolderA::Service::Response]
        def get_direct_thread(request_options: nil)
          response = @request_client.conn.get("/")
          FolderA::Service::Response.from_json(json_object: response)
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

        # @param request_options [RequestOptions]
        # @return [FolderA::Service::Response]
        def get_direct_thread(request_options: nil)
          Async.call do
            response = @request_client.conn.get("/")
            FolderA::Service::Response.from_json(json_object: response)
          end
        end
      end
    end
  end
end
