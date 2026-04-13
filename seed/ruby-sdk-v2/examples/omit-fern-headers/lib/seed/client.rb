# frozen_string_literal: true

module Seed
  class Client
    # @param base_url [String, nil]
    # @param token [String]
    #
    # @return [void]
    def initialize(token:, base_url: nil)
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url || Seed::Environment::PRODUCTION,
        headers: {
          Authorization: "Bearer #{token}"
        }
      )
    end

    # @return [Seed::FileNotificationService::Client]
    def file_notification_service
      @file_notification_service ||= Seed::FileNotificationService::Client.new(client: @raw_client)
    end

    # @return [Seed::FileService::Client]
    def file_service
      @file_service ||= Seed::FileService::Client.new(client: @raw_client)
    end

    # @return [Seed::HealthService::Client]
    def health_service
      @health_service ||= Seed::HealthService::Client.new(client: @raw_client)
    end

    # @return [Seed::Service::Client]
    def service
      @service ||= Seed::Service::Client.new(client: @raw_client)
    end
  end
end
