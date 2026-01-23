# frozen_string_literal: true

module FernEnum
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = FernEnum::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_enum/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [FernEnum::Headers::Client]
    def headers
      @headers ||= FernEnum::Headers::Client.new(client: @raw_client)
    end

    # @return [FernEnum::InlinedRequest::Client]
    def inlined_request
      @inlined_request ||= FernEnum::InlinedRequest::Client.new(client: @raw_client)
    end

    # @return [FernEnum::MultipartForm::Client]
    def multipart_form
      @multipart_form ||= FernEnum::MultipartForm::Client.new(client: @raw_client)
    end

    # @return [FernEnum::PathParam::Client]
    def path_param
      @path_param ||= FernEnum::PathParam::Client.new(client: @raw_client)
    end

    # @return [FernEnum::QueryParam::Client]
    def query_param
      @query_param ||= FernEnum::QueryParam::Client.new(client: @raw_client)
    end
  end
end
