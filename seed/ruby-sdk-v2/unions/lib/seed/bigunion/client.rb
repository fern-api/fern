# frozen_string_literal: true

module Seed
  module Bigunion
    class Client
      # @return [Seed::Bigunion::Client]
      def initialize(client:)
        @client = client
      end

      # @return [Seed::Bigunion::Types::BigUnion]
      def get(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "GET",
          path: "/#{params[:id]}"
        )
        _response = @client.send(_request)
        return Seed::Bigunion::Types::BigUnion.load(_response.body) if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # @return [bool]
      def update(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "PATCH",
          path: "",
          body: Seed::Bigunion::Types::BigUnion.new(params).to_h
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # @return [Hash[String, bool]]
      def update_many(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "PATCH",
          path: "/many",
          body: params
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end
    end
  end
end
