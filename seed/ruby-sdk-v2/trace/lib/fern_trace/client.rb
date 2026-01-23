# frozen_string_literal: true

module FernTrace
  class Client
    # @param base_url [String, nil]
    # @param token [String]
    #
    # @return [void]
    def initialize(token:, base_url: nil)
      @raw_client = FernTrace::Internal::Http::RawClient.new(
        base_url: base_url || FernTrace::Environment::PROD,
        headers: {
          "User-Agent" => "fern_trace/0.0.1",
          "X-Fern-Language" => "Ruby",
          Authorization: "Bearer #{token}"
        }
      )
    end

    # @return [FernTrace::V2::Client]
    def v_2
      @v_2 ||= FernTrace::V2::Client.new(client: @raw_client)
    end

    # @return [FernTrace::Admin::Client]
    def admin
      @admin ||= FernTrace::Admin::Client.new(client: @raw_client)
    end

    # @return [FernTrace::Homepage::Client]
    def homepage
      @homepage ||= FernTrace::Homepage::Client.new(client: @raw_client)
    end

    # @return [FernTrace::Migration::Client]
    def migration
      @migration ||= FernTrace::Migration::Client.new(client: @raw_client)
    end

    # @return [FernTrace::Playlist::Client]
    def playlist
      @playlist ||= FernTrace::Playlist::Client.new(client: @raw_client)
    end

    # @return [FernTrace::Problem::Client]
    def problem
      @problem ||= FernTrace::Problem::Client.new(client: @raw_client)
    end

    # @return [FernTrace::Submission::Client]
    def submission
      @submission ||= FernTrace::Submission::Client.new(client: @raw_client)
    end

    # @return [FernTrace::Sysprop::Client]
    def sysprop
      @sysprop ||= FernTrace::Sysprop::Client.new(client: @raw_client)
    end
  end
end
