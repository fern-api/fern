# frozen_string_literal: true

module Seed
  class Client
    # @param base_url [String, nil]
    # @param token [String]
    #
    # @return [void]
    def initialize(token:, base_url: nil)
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url || Seed::Environment::PROD,
        headers: {
          "User-Agent" => "fern_trace/0.0.1",
          "X-Fern-Language" => "Ruby",
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

  class AsyncClient
    # @param base_url [String, nil]
    # @param token [String]
    #
    # @return [void]
    def initialize(token:, base_url: nil)
      @raw_client = Seed::Internal::Http::AsyncRawClient.new(
        base_url: base_url || Seed::Environment::PROD,
        headers: {
          "User-Agent" => "fern_trace/0.0.1",
          "X-Fern-Language" => "Ruby",
          Authorization: "Bearer #{token}"
        }
      )
    end

    # @return [Seed::V2::AsyncClient]
    def v_2
      @v_2 ||= Seed::V2::AsyncClient.new(client: @raw_client)
    end

    # @return [Seed::Admin::AsyncClient]
    def admin
      @admin ||= Seed::Admin::AsyncClient.new(client: @raw_client)
    end

    # @return [Seed::Homepage::AsyncClient]
    def homepage
      @homepage ||= Seed::Homepage::AsyncClient.new(client: @raw_client)
    end

    # @return [Seed::Migration::AsyncClient]
    def migration
      @migration ||= Seed::Migration::AsyncClient.new(client: @raw_client)
    end

    # @return [Seed::Playlist::AsyncClient]
    def playlist
      @playlist ||= Seed::Playlist::AsyncClient.new(client: @raw_client)
    end

    # @return [Seed::Problem::AsyncClient]
    def problem
      @problem ||= Seed::Problem::AsyncClient.new(client: @raw_client)
    end

    # @return [Seed::Submission::AsyncClient]
    def submission
      @submission ||= Seed::Submission::AsyncClient.new(client: @raw_client)
    end

    # @return [Seed::Sysprop::AsyncClient]
    def sysprop
      @sysprop ||= Seed::Sysprop::AsyncClient.new(client: @raw_client)
    end
  end
end
