# frozen_string_literal: true

module Seed
  module Migration
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [Seed::Migration::Client]
      def initialize(client:)
        @client = client
      end

      # @option params [String] :admin_key_header
      #
      # @param request_options [Seed::RequestOptions]
      # @param params [Hash[untyped, untyped]]
      #
      # @return [Array[Seed::Migration::Types::Migration]]
      def get_attempted_migrations(request_options: {}, **_params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::PROD,
          method: "GET",
          path: "/migration-info/all"
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        return if code.between?(200, 299)

        error_class = Seed::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(_response.body, code: code)
      end
    end
  end
end
