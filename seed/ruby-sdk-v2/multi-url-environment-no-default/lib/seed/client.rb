# frozen_string_literal: true

module Seed
  class Client
    # @param base_url [String | nil]
    # @param token [String]
    #
    # @return [Seed::Client]
    def initialize(base_url:, token:)
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent": "fern_multi-url-environment-no-default/0.0.1",
          "X-Fern-Language": "Ruby",
          Authorization: "Bearer #{token}"
        }
      )
    end

    # @return [Seed::Ec2::Client]
    def ec_2
      @ec_2 ||= Seed::Ec2::Client.new(client: @raw_client)
    end

    # @return [Seed::S3::Client]
    def s_3
      @s_3 ||= Seed::S3::Client.new(client: @raw_client)
    end
  end
end
