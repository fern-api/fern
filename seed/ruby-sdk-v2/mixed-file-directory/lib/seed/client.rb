# frozen_string_literal: true

module Seed
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_mixed-file-directory/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [Seed::Organization::Client]
    def organization
      @organization ||= Seed::Organization::Client.new(client: @raw_client)
    end

    # @return [Seed::User::Client]
    def user
      @user ||= Seed::User::Client.new(client: @raw_client)
    end

    # @return [Seed::UserEvents::Client]
    def user_events
      @user_events ||= Seed::UserEvents::Client.new(client: @raw_client)
    end

    # @return [Seed::UserEventsMetadata::Client]
    def user_events_metadata
      @user_events_metadata ||= Seed::UserEventsMetadata::Client.new(client: @raw_client)
    end
  end
end
