# frozen_string_literal: true

module Seed
  module Users
    class Client
      # @return [Seed::Users::Client]
      def initialize(client:)
        @client = client
      end

      # @return [Seed::Types::UsernameCursor]
      def list_usernames_custom(request_options: {}, **params)
        _query_param_names = [
          ["starting_after"],
          %i[starting_after]
        ].flatten
        _query = params.slice(*_query_param_names)
        params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/users",
          query: _query
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        if code.between?(200, 299)
          Seed::Types::UsernameCursor.load(_response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end
      end
    end
  end
end
