# frozen_string_literal: true

module Seed
  module Endpoints
    class Client
      # @return [Seed::Endpoints::Client]
      def initialize(client:)
        @client = client
      end

      # @return [Seed::Container::Client]
      def container
        @container ||= Seed::Container::Client.new(client: @raw_client)
      end

      # @return [Seed::ContentType::Client]
      def contentType
        @contentType ||= Seed::ContentType::Client.new(client: @raw_client)
      end

      # @return [Seed::Enum::Client]
      def enum
        @enum ||= Seed::Enum::Client.new(client: @raw_client)
      end

      # @return [Seed::HttpMethods::Client]
      def httpMethods
        @httpMethods ||= Seed::HttpMethods::Client.new(client: @raw_client)
      end

      # @return [Seed::Object_::Client]
      def object
        @object ||= Seed::Object_::Client.new(client: @raw_client)
      end

      # @return [Seed::Params::Client]
      def params
        @params ||= Seed::Params::Client.new(client: @raw_client)
      end

      # @return [Seed::Primitive::Client]
      def primitive
        @primitive ||= Seed::Primitive::Client.new(client: @raw_client)
      end

      # @return [Seed::Put::Client]
      def put
        @put ||= Seed::Put::Client.new(client: @raw_client)
      end

      # @return [Seed::Union::Client]
      def union
        @union ||= Seed::Union::Client.new(client: @raw_client)
      end

      # @return [Seed::Urls::Client]
      def urls
        @urls ||= Seed::Urls::Client.new(client: @raw_client)
      end
    end
  end
end
