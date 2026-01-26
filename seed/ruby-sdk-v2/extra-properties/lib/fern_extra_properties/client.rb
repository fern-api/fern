# frozen_string_literal: true

module FernExtraProperties
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = FernExtraProperties::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_extra-properties/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [FernExtraProperties::User::Client]
    def user
      @user ||= FernExtraProperties::User::Client.new(client: @raw_client)
    end
  end
end
