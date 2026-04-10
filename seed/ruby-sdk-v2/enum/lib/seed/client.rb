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
          "User-Agent" => "fern_enum/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [Seed::Headers::Client]
    def headers
      @headers ||= Seed::Headers::Client.new(client: @raw_client)
    end

    # @return [Seed::Inlinedrequest::Client]
    def inlinedrequest
      @inlinedrequest ||= Seed::Inlinedrequest::Client.new(client: @raw_client)
    end

    # @return [Seed::Multipartform::Client]
    def multipartform
      @multipartform ||= Seed::Multipartform::Client.new(client: @raw_client)
    end

    # @return [Seed::Pathparam::Client]
    def pathparam
      @pathparam ||= Seed::Pathparam::Client.new(client: @raw_client)
    end

    # @return [Seed::Queryparam::Client]
    def queryparam
      @queryparam ||= Seed::Queryparam::Client.new(client: @raw_client)
    end
  end
end
