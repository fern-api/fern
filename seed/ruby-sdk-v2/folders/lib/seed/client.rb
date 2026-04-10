

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
    # @return [Seed::::Client]
    def 
      @ ||= Seed::::Client.new(client: @raw_client)
    end
    # @return [Seed::Ab::Client]
    def ab
      @ab ||= Seed::Ab::Client.new(client: @raw_client)
    end
    # @return [Seed::Ac::Client]
    def ac
      @ac ||= Seed::Ac::Client.new(client: @raw_client)
    end
    # @return [Seed::Folder::Client]
    def folder
      @folder ||= Seed::Folder::Client.new(client: @raw_client)
    end
    # @return [Seed::FolderService::Client]
    def folder_service
      @folder_service ||= Seed::FolderService::Client.new(client: @raw_client)
    end
  end
end
