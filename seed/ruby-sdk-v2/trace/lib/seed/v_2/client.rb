# frozen_string_literal: true

module Seed
  module V2
    class Client
      # @return [Seed::V2::Client]
      def initialize(client:)
        @client = client
      end

      # @return [untyped]
      def test(request_options: {}, **_params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "GET",
          path: ""
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # @return [Seed::Problem::Client]
      def problem
        @problem ||= Seed::V2::Problem::Client.new(client: @client)
      end

      # @return [Seed::V3::Client]
      def v_3
        @v_3 ||= Seed::V2::V3::Client.new(client: @client)
      end
    end
  end
end
