# frozen_string_literal: true

require "json"
require_relative "dog"
require_relative "cat"

module SeedExhaustiveClient
  module Types
    class Union
      class Animal
        # @return [Object]
        attr_reader :member
        # @return [String]
        attr_reader :discriminant

        private_class_method :new
        alias kind_of? is_a?

        # @param member [Object]
        # @param discriminant [String]
        # @return [SeedExhaustiveClient::Types::Union::Animal]
        def initialize(member:, discriminant:)
          @member = member
          @discriminant = discriminant
        end

        # Deserialize a JSON object to an instance of Animal
        #
        # @param json_object [String]
        # @return [SeedExhaustiveClient::Types::Union::Animal]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          member = case struct.animal
                   when "dog"
                     SeedExhaustiveClient::Types::Union::Dog.from_json(json_object: json_object)
                   when "cat"
                     SeedExhaustiveClient::Types::Union::Cat.from_json(json_object: json_object)
                   else
                     SeedExhaustiveClient::Types::Union::Dog.from_json(json_object: json_object)
                   end
          new(member: member, discriminant: struct.animal)
        end

        # For Union Types, to_json functionality is delegated to the wrapped member.
        #
        # @return [String]
        def to_json(*_args)
          case @discriminant
          when "dog"
            { **@member.to_json, animal: @discriminant }.to_json
          when "cat"
            { **@member.to_json, animal: @discriminant }.to_json
          else
            { "animal": @discriminant, value: @member }.to_json
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
          case obj.animal
          when "dog"
            SeedExhaustiveClient::Types::Union::Dog.validate_raw(obj: obj)
          when "cat"
            SeedExhaustiveClient::Types::Union::Cat.validate_raw(obj: obj)
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

        # @param member [SeedExhaustiveClient::Types::Union::Dog]
        # @return [SeedExhaustiveClient::Types::Union::Animal]
        def self.dog(member:)
          new(member: member, discriminant: "dog")
        end

        # @param member [SeedExhaustiveClient::Types::Union::Cat]
        # @return [SeedExhaustiveClient::Types::Union::Animal]
        def self.cat(member:)
          new(member: member, discriminant: "cat")
        end
      end
    end
  end
end
