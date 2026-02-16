# frozen_string_literal: true

require "json"
require_relative "completion_event"
require_relative "error_event"

module SeedServerSentEventsClient
  class Completions
    class StreamEvent
      # @return [Object]
      attr_reader :member
      # @return [String]
      attr_reader :discriminant

      private_class_method :new
      alias kind_of? is_a?

      # @param member [Object]
      # @param discriminant [String]
      # @return [SeedServerSentEventsClient::Completions::StreamEvent]
      def initialize(member:, discriminant:)
        @member = member
        @discriminant = discriminant
      end

      # Deserialize a JSON object to an instance of StreamEvent
      #
      # @param json_object [String]
      # @return [SeedServerSentEventsClient::Completions::StreamEvent]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        member = case struct.event
                 when "completion"
                   SeedServerSentEventsClient::Completions::CompletionEvent.from_json(json_object: json_object)
                 when "error"
                   SeedServerSentEventsClient::Completions::ErrorEvent.from_json(json_object: json_object)
                 else
                   SeedServerSentEventsClient::Completions::CompletionEvent.from_json(json_object: json_object)
                 end
        new(member: member, discriminant: struct.event)
      end

      # For Union Types, to_json functionality is delegated to the wrapped member.
      #
      # @return [String]
      def to_json(*_args)
        case @discriminant
        when "completion"
          { **@member.to_json, event: @discriminant }.to_json
        when "error"
          { **@member.to_json, event: @discriminant }.to_json
        else
          { "event": @discriminant, value: @member }.to_json
        end
        @member.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given
      #  hash and check each fields type against the current object's property
      #  definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        case obj.event
        when "completion"
          SeedServerSentEventsClient::Completions::CompletionEvent.validate_raw(obj: obj)
        when "error"
          SeedServerSentEventsClient::Completions::ErrorEvent.validate_raw(obj: obj)
        else
          raise("Passed value matched no type within the union, validation failed.")
        end
      end

      # For Union Types, is_a? functionality is delegated to the wrapped member.
      #
      # @param obj [Object]
      # @return [Boolean]
      def is_a?(obj)
        @member.is_a?(obj)
      end

      # @param member [SeedServerSentEventsClient::Completions::CompletionEvent]
      # @return [SeedServerSentEventsClient::Completions::StreamEvent]
      def self.completion(member:)
        new(member: member, discriminant: "completion")
      end

      # @param member [SeedServerSentEventsClient::Completions::ErrorEvent]
      # @return [SeedServerSentEventsClient::Completions::StreamEvent]
      def self.error(member:)
        new(member: member, discriminant: "error")
      end
    end
  end
end
