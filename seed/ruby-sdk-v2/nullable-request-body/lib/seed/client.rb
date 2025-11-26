# frozen_string_literal: true

module Seed
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url:)
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent": "fern_nullable-request-body/0.0.1",
          "X-Fern-Language": "Ruby"
        }
      )
    end

    # @return [Seed::TestGroup::Client]
    def test_group
      @test_group ||= Seed::TestGroup::Client.new(client: @raw_client)
    end
  end
end
