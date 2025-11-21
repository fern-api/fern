# frozen_string_literal: true

module Seed
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url:)
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent": "fern_oauth-client-credentials-with-variables/0.0.1",
          "X-Fern-Language": "Ruby"
        }
      )
    end

    # @return [Seed::Auth::Client]
    def auth
      @auth ||= Seed::Auth::Client.new(client: @raw_client)
    end

    # @return [Seed::NestedNoAuth::Client]
    def nested_no_auth
      @nested_no_auth ||= Seed::NestedNoAuth::Client.new(client: @raw_client)
    end

    # @return [Seed::Nested::Client]
    def nested
      @nested ||= Seed::Nested::Client.new(client: @raw_client)
    end

    # @return [Seed::Service::Client]
    def service
      @service ||= Seed::Service::Client.new(client: @raw_client)
    end

    # @return [Seed::Simple::Client]
    def simple
      @simple ||= Seed::Simple::Client.new(client: @raw_client)
    end
  end
end
