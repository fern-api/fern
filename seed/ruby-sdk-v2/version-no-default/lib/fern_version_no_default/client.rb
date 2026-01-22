# frozen_string_literal: true

module FernVersionNoDefault
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = FernVersionNoDefault::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_version-no-default/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [FernVersionNoDefault::User::Client]
    def user
      @user ||= FernVersionNoDefault::User::Client.new(client: @raw_client)
    end
  end
end
