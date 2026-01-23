# frozen_string_literal: true

module FernPagination
  class Client
    # @param base_url [String, nil]
    # @param token [String]
    #
    # @return [void]
    def initialize(token:, base_url: nil)
      @raw_client = FernPagination::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_pagination/0.0.1",
          "X-Fern-Language" => "Ruby",
          Authorization: "Bearer #{token}"
        }
      )
    end

    # @return [FernPagination::Complex::Client]
    def complex
      @complex ||= FernPagination::Complex::Client.new(client: @raw_client)
    end

    # @return [FernPagination::InlineUsers::Client]
    def inline_users
      @inline_users ||= FernPagination::InlineUsers::Client.new(client: @raw_client)
    end

    # @return [FernPagination::Users::Client]
    def users
      @users ||= FernPagination::Users::Client.new(client: @raw_client)
    end
  end
end
