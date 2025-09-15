# frozen_string_literal: true

module Seed
  module Service
    class Client
      # @return [Seed::Service::Client]
      def initialize(client:)
        @client = client
      end

      # @return [Seed::Service::Types::Resource]
      def get_resource(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "GET",
          path: "/resource/#{params[:ResourceID]}"
        )
        _response = @client.send(_request)
        return Seed::Service::Types::Resource.load(_response.body) if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # @return [Array[Seed::Service::Types::Resource]]
      def list_resources(request_options: {}, **params)
        _query_param_names = [
          %w[page_limit beforeDate],
          %i[page_limit beforeDate]
        ].flatten
        _query = params.slice(*_query_param_names)
        params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "GET",
          path: "/resource",
          query: _query
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end
    end
  end
end
