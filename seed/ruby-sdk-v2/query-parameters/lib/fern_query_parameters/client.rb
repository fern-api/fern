# frozen_string_literal: true

module FernQueryParameters
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = FernQueryParameters::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_query-parameters/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [FernQueryParameters::User::Client]
    def user
      @user ||= FernQueryParameters::User::Client.new(client: @raw_client)
    end
  end
end
