

module Seed
  class Client
    # @param base_url [String, nil]
    # @param token [String]
    #
    # @return [void]
    def initialize(base_url: nil, token:)
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url || Seed::Environment::PRODUCTION,
        headers: {
          "User-Agent" => "fern_examples/0.0.1",
          "X-Fern-Language" => "Ruby",
          Authorization: "Bearer #{token}"
        }
      )
    end
    # @return [Seed::::Client]
    def 
      @ ||= Seed::::Client.new(client: @raw_client)
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
