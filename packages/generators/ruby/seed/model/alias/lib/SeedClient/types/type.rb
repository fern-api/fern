# frozen_string_literal: true

module SeedClient
  class Type
    attr_reader :id, :name, :additional_properties

    # @param id [TypeId]
    # @param name [String]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [Type]
    def initialze(id:, name:, additional_properties: nil)
      # @type [TypeId]
      @id = id
      # @type [String]
      @name = name
      # @type [OpenStruct]
      @additional_properties = additional_properties
    end

    # Deserialize a JSON object to an instance of Type
    #
    # @param json_object [JSON]
    # @return [Type]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      id = TypeId.from_json(json_object: struct.id)
      name = struct.name
      new(id: id, name: name, additional_properties: struct)
    end

    # Serialize an instance of Type to a JSON object
    #
    # @return [JSON]
    def to_json(*_args)
      {
        id: @id,
        name: @name
      }.to_json
    end
  end
end
