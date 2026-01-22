# frozen_string_literal: true

module FernMixedFileDirectory
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = FernMixedFileDirectory::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_mixed-file-directory/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [FernMixedFileDirectory::Organization::Client]
    def organization
      @organization ||= FernMixedFileDirectory::Organization::Client.new(client: @raw_client)
    end

    # @return [FernMixedFileDirectory::User::Client]
    def user
      @user ||= FernMixedFileDirectory::User::Client.new(client: @raw_client)
    end
  end
end
