# frozen_string_literal: true

module Seed
  module PathParam
    class Client
      # @return [Seed::PathParam::Client]
      def initialize(client:)
        @client = client
      end

      # @return [untyped]
      def send_(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "path/#{params[:operand]}/#{params[:operandOrColor]}"
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end
    end
  end
end
