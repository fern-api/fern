# frozen_string_literal: true

require_relative "json"
require_relative "commons/types/types/Metadata"
require_relative "commons/types/types/TAG"

module SeedClient
  module Commons
    module Types
      class EventInfo
        attr_reader :member, :discriminant

        private_class_method :new
        alias kind_of? is_a?
        # @param member [Object]
        # @param discriminant [String]
        # @return [Commons::Types::EventInfo]
        def initialze(member:, discriminant:)
          # @type [Object]
          @member = member
          # @type [String]
          @discriminant = discriminant
        end

        # Deserialize a JSON object to an instance of EventInfo
        #
        # @param json_object [JSON]
        # @return [Commons::Types::EventInfo]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          member = case struct.type
                   when "metadata"
                     Commons::Types::Metadata.from_json(json_object: json_object)
                   when "tag"
                     Commons::Types::TAG.from_json(json_object: json_object.value)
                   else
                     Commons::Types::Metadata.from_json(json_object: json_object)
                   end
          new(member: member, discriminant: struct.type)
        end

        # For Union Types, to_json functionality is delegated to the wrapped member.
        #
        # @return [JSON]
        def to_json(*_args)
          case @discriminant
          when "metadata"
            { type: @discriminant, **@member.to_json }.to_json
          when "tag"
            { type: @discriminant, value: @member }.to_json
          else
            { type: @discriminant, value: @member }.to_json
          end
          @member.to_json
        end

        # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
        #
        # @param obj [Object]
        # @return [Void]
        def self.validate_raw(obj:)
          case obj.type
          when "metadata"
            Commons::Types::Metadata.validate_raw(obj: obj)
          when "tag"
            Commons::Types::TAG.validate_raw(obj: obj)
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

        # @param member [Commons::Types::Metadata]
        # @return [Commons::Types::EventInfo]
        def self.metadata(member:)
          new(member: member, discriminant: "metadata")
        end

        # @param member [Commons::Types::TAG]
        # @return [Commons::Types::EventInfo]
        def self.tag(member:)
          new(member: member, discriminant: "tag")
        end
      end
    end
  end
end
