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
          "User-Agent" => "fern_cross-package-type-names/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [Seed::FolderA::Client]
    def folder_a
      @folder_a ||= Seed::FolderA::Client.new(client: @raw_client)
    end

    # @return [Seed::FolderD::Client]
    def folder_d
      @folder_d ||= Seed::FolderD::Client.new(client: @raw_client)
    end

    # @return [Seed::Foo::Client]
    def foo
      @foo ||= Seed::Foo::Client.new(client: @raw_client)
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
          "User-Agent" => "fern_cross-package-type-names/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [Seed::FolderA::AsyncClient]
    def folder_a
      @folder_a ||= Seed::FolderA::AsyncClient.new(client: @raw_client)
    end

    # @return [Seed::FolderD::AsyncClient]
    def folder_d
      @folder_d ||= Seed::FolderD::AsyncClient.new(client: @raw_client)
    end

    # @return [Seed::Foo::AsyncClient]
    def foo
      @foo ||= Seed::Foo::AsyncClient.new(client: @raw_client)
    end
  end
end
