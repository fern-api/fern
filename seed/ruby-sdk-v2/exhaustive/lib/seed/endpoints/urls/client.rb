# frozen_string_literal: true

module Seed
  module Endpoints
    module Urls
      class Client
        # @return [Seed::Endpoints::Urls::Client]
        def initialize(client:)
          @client = client
        end

        # @return [String]
        def with_mixed_case(request_options: {}, **params)
          _request = params
          _response = @client.send(_request)
          return if _response.code >= "200" && _response.code < "300"

          raise _response.body
        end

        # @return [String]
        def no_ending_slash(request_options: {}, **params)
          _request = params
          _response = @client.send(_request)
          return if _response.code >= "200" && _response.code < "300"

          raise _response.body
        end

        # @return [String]
        def with_ending_slash(request_options: {}, **params)
          _request = params
          _response = @client.send(_request)
          return if _response.code >= "200" && _response.code < "300"

          raise _response.body
        end

        # @return [String]
        def with_underscores(request_options: {}, **params)
          _request = params
          _response = @client.send(_request)
          return if _response.code >= "200" && _response.code < "300"

          raise _response.body
        end
      end
    end
  end
end
