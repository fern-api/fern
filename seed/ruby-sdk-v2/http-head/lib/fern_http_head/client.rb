# frozen_string_literal: true

module FernHttpHead
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = FernHttpHead::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_http-head/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [FernHttpHead::User::Client]
    def user
      @user ||= FernHttpHead::User::Client.new(client: @raw_client)
    end
  end
end
