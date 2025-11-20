# frozen_string_literal: true

module Seed
  class Client
    # @param base_url [String | nil]
    #
    # @return [Seed::Client]
    def initialize(base_url:)
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent": "fern_path-parameters/0.0.1",
          "X-Fern-Language": "Ruby"
        }
      )
    end

    # @return [Seed::Organizations::Client]
    def organizations
      @organizations ||= Seed::Organizations::Client.new(client: @raw_client)
    end

    # @return [Seed::User::Client]
    def user
      @user ||= Seed::User::Client.new(client: @raw_client)
    end
  end
end
