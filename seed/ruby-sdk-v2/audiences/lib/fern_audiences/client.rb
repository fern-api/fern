# frozen_string_literal: true

module FernAudiences
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = FernAudiences::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_audiences/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [FernAudiences::FolderA::Client]
    def folder_a
      @folder_a ||= FernAudiences::FolderA::Client.new(client: @raw_client)
    end

    # @return [FernAudiences::FolderD::Client]
    def folder_d
      @folder_d ||= FernAudiences::FolderD::Client.new(client: @raw_client)
    end

    # @return [FernAudiences::Foo::Client]
    def foo
      @foo ||= FernAudiences::Foo::Client.new(client: @raw_client)
    end
  end
end
