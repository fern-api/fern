# frozen_string_literal: true

module FernExamples
  module File
    module Notification
      class Client
        # @param client [FernExamples::Internal::Http::RawClient]
        #
        # @return [void]
        def initialize(client:)
          @client = client
        end

        # @return [FernExamples::Service::Client]
        def service
          @service ||= FernExamples::File::Notification::Service::Client.new(client: @client)
        end
      end
    end
  end
end
