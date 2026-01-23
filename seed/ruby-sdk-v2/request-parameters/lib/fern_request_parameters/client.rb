# frozen_string_literal: true

module FernRequestParameters
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = FernRequestParameters::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_request-parameters/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [FernRequestParameters::User::Client]
    def user
      @user ||= FernRequestParameters::User::Client.new(client: @raw_client)
    end
  end
end
