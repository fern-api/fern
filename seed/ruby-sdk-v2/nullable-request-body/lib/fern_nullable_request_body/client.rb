# frozen_string_literal: true

module FernNullableRequestBody
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = FernNullableRequestBody::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_nullable-request-body/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [FernNullableRequestBody::TestGroup::Client]
    def test_group
      @test_group ||= FernNullableRequestBody::TestGroup::Client.new(client: @raw_client)
    end
  end
end
