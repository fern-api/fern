# frozen_string_literal: true

module FernSimpleApi
  class Client
    # @param base_url [String, nil]
    # @param token [String]
    #
    # @return [void]
    def initialize(token:, base_url: nil)
      @raw_client = FernSimpleApi::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_simple-api/0.0.1",
          "X-Fern-Language" => "Ruby",
          Authorization: "Bearer #{token}"
        }
      )
    end

    # @return [FernSimpleApi::User::Client]
    def user
      @user ||= FernSimpleApi::User::Client.new(client: @raw_client)
    end
  end
end
