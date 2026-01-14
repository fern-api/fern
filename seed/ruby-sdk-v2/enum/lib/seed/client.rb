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

  class AsyncClient
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = Seed::Internal::Http::AsyncRawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_enum/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [Seed::Headers::AsyncClient]
    def headers
      @headers ||= Seed::Headers::AsyncClient.new(client: @raw_client)
    end

    # @return [Seed::InlinedRequest::AsyncClient]
    def inlined_request
      @inlined_request ||= Seed::InlinedRequest::AsyncClient.new(client: @raw_client)
    end

    # @return [Seed::MultipartForm::AsyncClient]
    def multipart_form
      @multipart_form ||= Seed::MultipartForm::AsyncClient.new(client: @raw_client)
    end

    # @return [Seed::PathParam::AsyncClient]
    def path_param
      @path_param ||= Seed::PathParam::AsyncClient.new(client: @raw_client)
    end

    # @return [Seed::QueryParam::AsyncClient]
    def query_param
      @query_param ||= Seed::QueryParam::AsyncClient.new(client: @raw_client)
    end
  end
end
