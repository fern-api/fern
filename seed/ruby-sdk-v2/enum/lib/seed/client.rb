# frozen_string_literal: true

module Seed
  class Client
    # @return [Seed::Client]
    def initialize(base_url:)
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent": "fern_enum/0.0.1",
          "X-Fern-Language": "Ruby"
        }
      )
    end

    # @return [Seed::Headers::Client]
    def headers
      @headers ||= Seed::Headers::Client.new(client: @raw_client)
    end

    # @return [Seed::InlinedRequest::Client]
    def inlined_request
      @inlined_request ||= Seed::InlinedRequest::Client.new(client: @raw_client)
    end

    # @return [Seed::MultipartForm::Client]
    def multipart_form
      @multipart_form ||= Seed::MultipartForm::Client.new(client: @raw_client)
    end

    # @return [Seed::PathParam::Client]
    def path_param
      @path_param ||= Seed::PathParam::Client.new(client: @raw_client)
    end

    # @return [Seed::QueryParam::Client]
    def query_param
      @query_param ||= Seed::QueryParam::Client.new(client: @raw_client)
    end
  end
end
