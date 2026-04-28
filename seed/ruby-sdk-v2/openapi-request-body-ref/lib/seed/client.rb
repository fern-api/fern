# frozen_string_literal: true

module Seed
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_openapi-request-body-ref/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [Seed::Vendor::Client]
    def vendor
      @vendor ||= Seed::Vendor::Client.new(client: @raw_client)
    end

    # @return [Seed::Catalog::Client]
    def catalog
      @catalog ||= Seed::Catalog::Client.new(client: @raw_client)
    end

    # @return [Seed::TeamMember::Client]
    def team_member
      @team_member ||= Seed::TeamMember::Client.new(client: @raw_client)
    end
  end
end
