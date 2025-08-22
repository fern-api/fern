# frozen_string_literal: true

module Seed
  module Unknown
    class Client
      # @return [Seed::Unknown::Client]
      def initialize(client:)
        @client = client
      end

      # @return [Array[Hash[String, Object]]]
      def post(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "",
          body: params
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # @return [Array[Hash[String, Object]]]
      def post_object(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "/with-object",
          body: Seed::Unknown::Types::MyObject.new(params).to_h
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end
    end
  end
end
