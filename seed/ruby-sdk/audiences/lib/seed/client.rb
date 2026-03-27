

module Seed
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_audiences/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end
    # @return [Seed::FolderA::Client]
    def folder-a
      @folder-a ||= Seed::FolderA::Client.new(client: @raw_client)
    end
    # @return [Seed::FolderD::Client]
    def folder-d
      @folder-d ||= Seed::FolderD::Client.new(client: @raw_client)
    end
    # @return [Seed::Foo::Client]
    def foo
      @foo ||= Seed::Foo::Client.new(client: @raw_client)
    end
  end
end
