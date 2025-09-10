
module Seed
  module Sysprop
    class Client
      # @return [Seed::Sysprop::Client]
      def initialize(client:)
        @client = client
      end

      # @return [untyped]
      def set_num_warm_instances(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "PUT",
          path: "/sysprop/num-warm-instances/#{/#{"
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return
        else
          raise _response.body
        end
      end

      # @return [Hash[Seed::Commons::Types::Language, Integer]]
      def get_num_warm_instances(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "GET",
          path: "/sysprop/num-warm-instances"
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return 
        else
          raise _response.body
        end
      end

    end
  end
end
