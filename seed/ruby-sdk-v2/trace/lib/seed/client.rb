# frozen_string_literal: true

module Seed
  class Client
    # @param token [String]
    # @param base_url [String, nil]
    # @param x_random_header [String, nil]
    # @param max_retries [Integer]
    #
    # @return [void]
    def initialize(token:, base_url: nil, x_random_header: nil, max_retries: 2)
      headers = {
        "User-Agent" => "fern_trace/0.0.1",
        "X-Fern-Language" => "Ruby",
        Authorization: "Bearer #{token}"
      }
      headers["X-Random-Header"] = x_random_header.to_s unless x_random_header.nil?
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url || Seed::Environment::PROD,
        headers: headers,
        overridable_headers: %w[X-Random-Header],
        max_retries: max_retries
      )
    end

    # @return [Seed::V2::Client]
    def v2
      @v2 ||= Seed::V2::Client.new(client: @raw_client)
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
