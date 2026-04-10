# frozen_string_literal: true

module Seed
  module File
    module Notification
      class Client
        # @param client [Seed::Internal::Http::RawClient]
        #
        # @return [void]
        def initialize(client:)
          @client = client
        end

        # @return [Seed::Service::Client]
        def service
          @service ||= Seed::File::Notification::Service::Client.new(client: @client)
        end
      end
    end
  end
end
