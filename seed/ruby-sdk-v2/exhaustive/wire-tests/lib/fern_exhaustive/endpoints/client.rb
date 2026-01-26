# frozen_string_literal: true

module FernExhaustive
  module Endpoints
    class Client
      # @param client [FernExhaustive::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @return [FernExhaustive::Container::Client]
      def container
        @container ||= FernExhaustive::Endpoints::Container::Client.new(client: @client)
      end

      # @return [FernExhaustive::ContentType::Client]
      def content_type
        @content_type ||= FernExhaustive::Endpoints::ContentType::Client.new(client: @client)
      end

      # @return [FernExhaustive::Enum::Client]
      def enum
        @enum ||= FernExhaustive::Endpoints::Enum::Client.new(client: @client)
      end

      # @return [FernExhaustive::HttpMethods::Client]
      def http_methods
        @http_methods ||= FernExhaustive::Endpoints::HttpMethods::Client.new(client: @client)
      end

      # @return [FernExhaustive::Object_::Client]
      def object
        @object ||= FernExhaustive::Endpoints::Object_::Client.new(client: @client)
      end

      # @return [FernExhaustive::Params::Client]
      def params
        @params ||= FernExhaustive::Endpoints::Params::Client.new(client: @client)
      end

      # @return [FernExhaustive::Primitive::Client]
      def primitive
        @primitive ||= FernExhaustive::Endpoints::Primitive::Client.new(client: @client)
      end

      # @return [FernExhaustive::Put::Client]
      def put
        @put ||= FernExhaustive::Endpoints::Put::Client.new(client: @client)
      end

      # @return [FernExhaustive::Union::Client]
      def union
        @union ||= FernExhaustive::Endpoints::Union::Client.new(client: @client)
      end

      # @return [FernExhaustive::Urls::Client]
      def urls
        @urls ||= FernExhaustive::Endpoints::Urls::Client.new(client: @client)
      end
    end
  end
end
