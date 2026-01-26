# frozen_string_literal: true

module FernMultiLineDocs
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = FernMultiLineDocs::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_multi-line-docs/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [FernMultiLineDocs::User::Client]
    def user
      @user ||= FernMultiLineDocs::User::Client.new(client: @raw_client)
    end
  end
end
