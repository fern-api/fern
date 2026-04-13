# frozen_string_literal: true

module Seed
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url || Seed::Environment::DEFAULT,
        headers: {
          "User-Agent" => "fern_audiences/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [Seed::FolderAService::Client]
    def folder_a_service
      @folder_a_service ||= Seed::FolderAService::Client.new(client: @raw_client)
    end

    # @return [Seed::Foo::Client]
    def foo
      @foo ||= Seed::Foo::Client.new(client: @raw_client)
    end

    # @return [Seed::FolderDService::Client]
    def folder_d_service
      @folder_d_service ||= Seed::FolderDService::Client.new(client: @raw_client)
    end
  end
end
