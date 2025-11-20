# frozen_string_literal: true

module Seed
  module Endpoints
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [Seed::Endpoints::Client]
      def initialize(client:)
        @client = client
      end

      # @return [Seed::Container::Client]
      def container
        @container ||= Seed::Endpoints::Container::Client.new(client: @client)
      end

      # @return [Seed::ContentType::Client]
      def content_type
        @content_type ||= Seed::Endpoints::ContentType::Client.new(client: @client)
      end

      # @return [Seed::Enum::Client]
      def enum
        @enum ||= Seed::Endpoints::Enum::Client.new(client: @client)
      end

      # @return [Seed::HttpMethods::Client]
      def http_methods
        @http_methods ||= Seed::Endpoints::HttpMethods::Client.new(client: @client)
      end

      # @return [Seed::Object_::Client]
      def object
        @object ||= Seed::Endpoints::Object_::Client.new(client: @client)
      end

      # @return [Seed::Params::Client]
      def params
        @params ||= Seed::Endpoints::Params::Client.new(client: @client)
      end

      # @return [Seed::Primitive::Client]
      def primitive
        @primitive ||= Seed::Endpoints::Primitive::Client.new(client: @client)
      end

      # @return [Seed::Put::Client]
      def put
        @put ||= Seed::Endpoints::Put::Client.new(client: @client)
      end

      # @return [Seed::Union::Client]
      def union
        @union ||= Seed::Endpoints::Union::Client.new(client: @client)
      end

      # @return [Seed::Urls::Client]
      def urls
        @urls ||= Seed::Endpoints::Urls::Client.new(client: @client)
      end
    end
  end
end
