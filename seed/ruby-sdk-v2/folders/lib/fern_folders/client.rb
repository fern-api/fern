# frozen_string_literal: true

module FernFolders
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = FernFolders::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_folders/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [FernFolders::A::Client]
    def a
      @a ||= FernFolders::A::Client.new(client: @raw_client)
    end

    # @return [FernFolders::Folder::Client]
    def folder
      @folder ||= FernFolders::Folder::Client.new(client: @raw_client)
    end
  end
end
