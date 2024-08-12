# frozen_string_literal: true

require_relative "patient"
require_relative "practitioner"
require_relative "resource_list"
require_relative "memo"
require "ostruct"
require "json"

module SeedApiClient
  class Account
    # @return [String]
    attr_reader :resource_type
    # @return [String]
    attr_reader :name
    # @return [SeedApiClient::Patient]
    attr_reader :patient
    # @return [SeedApiClient::Practitioner]
    attr_reader :practitioner
    # @return [String]
    attr_reader :id
    # @return [Array<SeedApiClient::ResourceList>]
    attr_reader :related_resources
    # @return [SeedApiClient::Memo]
    attr_reader :memo
    # @return [OpenStruct] Additional properties unmapped to the current class definition
    attr_reader :additional_properties
    # @return [Object]
    attr_reader :_field_set
    protected :_field_set

    OMIT = Object.new

    # @param resource_type [String]
    # @param name [String]
    # @param patient [SeedApiClient::Patient]
    # @param practitioner [SeedApiClient::Practitioner]
    # @param id [String]
    # @param related_resources [Array<SeedApiClient::ResourceList>]
    # @param memo [SeedApiClient::Memo]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [SeedApiClient::Account]
    def initialize(resource_type:, name:, id:, related_resources:, memo:, patient: OMIT, practitioner: OMIT,
                   additional_properties: nil)
      @resource_type = resource_type
      @name = name
      @patient = patient if patient != OMIT
      @practitioner = practitioner if practitioner != OMIT
      @id = id
      @related_resources = related_resources
      @memo = memo
      @additional_properties = additional_properties
      @_field_set = {
        "resource_type": resource_type,
        "name": name,
        "patient": patient,
        "practitioner": practitioner,
        "id": id,
        "related_resources": related_resources,
        "memo": memo
      }.reject do |_k, v|
        v == OMIT
      end
    end

    # Deserialize a JSON object to an instance of Account
    #
    # @param json_object [String]
    # @return [SeedApiClient::Account]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      parsed_json = JSON.parse(json_object)
      resource_type = parsed_json["resource_type"]
      name = parsed_json["name"]
      if parsed_json["patient"].nil?
        patient = nil
      else
        patient = parsed_json["patient"].to_json
        patient = SeedApiClient::Patient.from_json(json_object: patient)
      end
      if parsed_json["practitioner"].nil?
        practitioner = nil
      else
        practitioner = parsed_json["practitioner"].to_json
        practitioner = SeedApiClient::Practitioner.from_json(json_object: practitioner)
      end
      id = parsed_json["id"]
      related_resources = parsed_json["related_resources"]&.map do |item|
        item = item.to_json
        SeedApiClient::ResourceList.from_json(json_object: item)
      end
      if parsed_json["memo"].nil?
        memo = nil
      else
        memo = parsed_json["memo"].to_json
        memo = SeedApiClient::Memo.from_json(json_object: memo)
      end
      new(
        resource_type: resource_type,
        name: name,
        patient: patient,
        practitioner: practitioner,
        id: id,
        related_resources: related_resources,
        memo: memo,
        additional_properties: struct
      )
    end

    # Serialize an instance of Account to a JSON object
    #
    # @return [String]
    def to_json(*_args)
      @_field_set&.to_json
    end

    # Leveraged for Union-type generation, validate_raw attempts to parse the given
    #  hash and check each fields type against the current object's property
    #  definitions.
    #
    # @param obj [Object]
    # @return [Void]
    def self.validate_raw(obj:)
      obj.resource_type.is_a?(String) != false || raise("Passed value for field obj.resource_type is not the expected type, validation failed.")
      obj.name.is_a?(String) != false || raise("Passed value for field obj.name is not the expected type, validation failed.")
      obj.patient.nil? || SeedApiClient::Patient.validate_raw(obj: obj.patient)
      obj.practitioner.nil? || SeedApiClient::Practitioner.validate_raw(obj: obj.practitioner)
      obj.id.is_a?(String) != false || raise("Passed value for field obj.id is not the expected type, validation failed.")
      obj.related_resources.is_a?(Array) != false || raise("Passed value for field obj.related_resources is not the expected type, validation failed.")
      SeedApiClient::Memo.validate_raw(obj: obj.memo)
    end
  end
end
