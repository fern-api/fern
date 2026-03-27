

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
    # @return [Seed::InlinedRequest::Client]
    def inlined-request
      @inlined-request ||= Seed::InlinedRequest::Client.new(client: @raw_client)
    end
    # @return [Seed::MultipartForm::Client]
    def multipart-form
      @multipart-form ||= Seed::MultipartForm::Client.new(client: @raw_client)
    end
    # @return [Seed::PathParam::Client]
    def path-param
      @path-param ||= Seed::PathParam::Client.new(client: @raw_client)
    end
    # @return [Seed::QueryParam::Client]
    def query-param
      @query-param ||= Seed::QueryParam::Client.new(client: @raw_client)
    end
  end
end
