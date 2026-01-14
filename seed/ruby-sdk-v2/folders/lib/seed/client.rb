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
          "User-Agent" => "fern_folders/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [Seed::A::Client]
    def a
      @a ||= Seed::A::Client.new(client: @raw_client)
    end

    # @return [Seed::Folder::Client]
    def folder
      @folder ||= Seed::Folder::Client.new(client: @raw_client)
    end
  end

  class AsyncClient
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = Seed::Internal::Http::AsyncRawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_folders/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [Seed::A::AsyncClient]
    def a
      @a ||= Seed::A::AsyncClient.new(client: @raw_client)
    end

    # @return [Seed::Folder::AsyncClient]
    def folder
      @folder ||= Seed::Folder::AsyncClient.new(client: @raw_client)
    end
  end
end
