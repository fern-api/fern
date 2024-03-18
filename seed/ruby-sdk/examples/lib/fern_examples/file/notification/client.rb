# frozen_string_literal: true

require_relative "../../../requests"
require_relative "service/client"

module SeedExamplesClient
  module File
    module Notification
      class Client
        attr_reader :service

        # @param request_client [RequestClient]
        # @return [File::Notification::Client]
        def initialize(request_client:)
          @service = File::Notification::ServiceClient.new(request_client: request_client)
        end
      end

      class AsyncClient
        attr_reader :service

        # @param request_client [RequestClient]
        # @return [File::Notification::AsyncClient]
        def initialize(request_client:)
          @service = File::Notification::AsyncServiceClient.new(request_client: request_client)
        end
      end
    end
  end
end
