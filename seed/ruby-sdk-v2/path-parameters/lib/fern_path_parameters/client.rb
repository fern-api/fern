# frozen_string_literal: true

module FernPathParameters
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = FernPathParameters::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_path-parameters/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [FernPathParameters::Organizations::Client]
    def organizations
      @organizations ||= FernPathParameters::Organizations::Client.new(client: @raw_client)
    end

    # @return [FernPathParameters::User::Client]
    def user
      @user ||= FernPathParameters::User::Client.new(client: @raw_client)
    end
  end
end
