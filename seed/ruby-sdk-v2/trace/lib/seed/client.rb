# frozen_string_literal: true

module Seed
  class Client
    # @param base_url [String | nil]
    # @param token [String]
    #
    # @return [Seed::Client]
    def initialize(base_url:, token:)
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent": "fern_trace/0.0.1",
          "X-Fern-Language": "Ruby",
          Authorization: "Bearer #{token}"
        }
      )
    end

    # @return [Seed::V2::Client]
    def v_2
      @v_2 ||= Seed::V2::Client.new(client: @raw_client)
    end

    # @return [Seed::Admin::Client]
    def admin
      @admin ||= Seed::Admin::Client.new(client: @raw_client)
    end

    # @return [Seed::Homepage::Client]
    def homepage
      @homepage ||= Seed::Homepage::Client.new(client: @raw_client)
    end

    # @return [Seed::Migration::Client]
    def migration
      @migration ||= Seed::Migration::Client.new(client: @raw_client)
    end

    # @return [Seed::Playlist::Client]
    def playlist
      @playlist ||= Seed::Playlist::Client.new(client: @raw_client)
    end

    # @return [Seed::Problem::Client]
    def problem
      @problem ||= Seed::Problem::Client.new(client: @raw_client)
    end

    # @return [Seed::Submission::Client]
    def submission
      @submission ||= Seed::Submission::Client.new(client: @raw_client)
    end

    # @return [Seed::Sysprop::Client]
    def sysprop
      @sysprop ||= Seed::Sysprop::Client.new(client: @raw_client)
    end
  end
end
