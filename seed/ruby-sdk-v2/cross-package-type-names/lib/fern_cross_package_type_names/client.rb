# frozen_string_literal: true

module FernCrossPackageTypeNames
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = FernCrossPackageTypeNames::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_cross-package-type-names/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [FernCrossPackageTypeNames::FolderA::Client]
    def folder_a
      @folder_a ||= FernCrossPackageTypeNames::FolderA::Client.new(client: @raw_client)
    end

    # @return [FernCrossPackageTypeNames::FolderD::Client]
    def folder_d
      @folder_d ||= FernCrossPackageTypeNames::FolderD::Client.new(client: @raw_client)
    end

    # @return [FernCrossPackageTypeNames::Foo::Client]
    def foo
      @foo ||= FernCrossPackageTypeNames::Foo::Client.new(client: @raw_client)
    end
  end
end
