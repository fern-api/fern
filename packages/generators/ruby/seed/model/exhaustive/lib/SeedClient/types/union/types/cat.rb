# frozen_string_literal: true

module SeedClient
  module Types
    module Union
      class Cat
        attr_reader :name, :likes_to_meow, :additional_properties

        # @param name [String]
        # @param likes_to_meow [Boolean]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [Types::Union::Cat]
        def initialze(name:, likes_to_meow:, additional_properties: nil)
          # @type [String]
          @name = name
          # @type [Boolean]
          @likes_to_meow = likes_to_meow
          # @type [OpenStruct]
          @additional_properties = additional_properties
        end

        # Deserialize a JSON object to an instance of Cat
        #
        # @param json_object [JSON]
        # @return [Types::Union::Cat]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          name = struct.name
          likes_to_meow = struct.likesToMeow
          new(name: name, likes_to_meow: likes_to_meow, additional_properties: struct)
        end

        # Serialize an instance of Cat to a JSON object
        #
        # @return [JSON]
        def to_json(*_args)
          {
            name: @name,
            likesToMeow: @likes_to_meow
          }.to_json
        end
      end
    end
  end
end
