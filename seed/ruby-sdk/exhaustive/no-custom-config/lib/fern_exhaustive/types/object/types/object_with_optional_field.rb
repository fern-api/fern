# frozen_string_literal: true

require "date"
require "set"
require "ostruct"
require "json"

module SeedExhaustiveClient
  module Types
    class Object_
      class ObjectWithOptionalField
        # @return [String] This is a rather long descriptor of this single field in a more complex type. If
        #  you ask me I think this is a pretty good description for this field all things
        #  considered.
        attr_reader :string
        # @return [Integer]
        attr_reader :integer
        # @return [Long]
        attr_reader :long
        # @return [Float]
        attr_reader :double
        # @return [Boolean]
        attr_reader :bool
        # @return [DateTime]
        attr_reader :datetime
        # @return [Date]
        attr_reader :date
        # @return [String]
        attr_reader :uuid
        # @return [String]
        attr_reader :base_64
        # @return [Array<String>]
        attr_reader :list
        # @return [Set<String>]
        attr_reader :set
        # @return [Hash{Integer => String}]
        attr_reader :map
        # @return [String]
        attr_reader :bigint
        # @return [OpenStruct] Additional properties unmapped to the current class definition
        attr_reader :additional_properties
        # @return [Object]
        attr_reader :_field_set
        protected :_field_set

        OMIT = Object.new

        # @param string [String] This is a rather long descriptor of this single field in a more complex type. If
        #  you ask me I think this is a pretty good description for this field all things
        #  considered.
        # @param integer [Integer]
        # @param long [Long]
        # @param double [Float]
        # @param bool [Boolean]
        # @param datetime [DateTime]
        # @param date [Date]
        # @param uuid [String]
        # @param base_64 [String]
        # @param list [Array<String>]
        # @param set [Set<String>]
        # @param map [Hash{Integer => String}]
        # @param bigint [String]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [SeedExhaustiveClient::Types::Object_::ObjectWithOptionalField]
        def initialize(string: OMIT, integer: OMIT, long: OMIT, double: OMIT, bool: OMIT, datetime: OMIT, date: OMIT,
                       uuid: OMIT, base_64: OMIT, list: OMIT, set: OMIT, map: OMIT, bigint: OMIT, additional_properties: nil)
          @string = string if string != OMIT
          @integer = integer if integer != OMIT
          @long = long if long != OMIT
          @double = double if double != OMIT
          @bool = bool if bool != OMIT
          @datetime = datetime if datetime != OMIT
          @date = date if date != OMIT
          @uuid = uuid if uuid != OMIT
          @base_64 = base_64 if base_64 != OMIT
          @list = list if list != OMIT
          @set = set if set != OMIT
          @map = map if map != OMIT
          @bigint = bigint if bigint != OMIT
          @additional_properties = additional_properties
          @_field_set = {
            "string": string,
            "integer": integer,
            "long": long,
            "double": double,
            "bool": bool,
            "datetime": datetime,
            "date": date,
            "uuid": uuid,
            "base64": base_64,
            "list": list,
            "set": set,
            "map": map,
            "bigint": bigint
          }.reject do |_k, v|
            v == OMIT
          end
        end

        # Deserialize a JSON object to an instance of ObjectWithOptionalField
        #
        # @param json_object [String]
        # @return [SeedExhaustiveClient::Types::Object_::ObjectWithOptionalField]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          parsed_json = JSON.parse(json_object)
          string = parsed_json["string"]
          integer = parsed_json["integer"]
          long = parsed_json["long"]
          double = parsed_json["double"]
          bool = parsed_json["bool"]
          datetime = (DateTime.parse(parsed_json["datetime"]) unless parsed_json["datetime"].nil?)
          date = (Date.parse(parsed_json["date"]) unless parsed_json["date"].nil?)
          uuid = parsed_json["uuid"]
          base_64 = parsed_json["base64"]
          list = parsed_json["list"]
          if parsed_json["set"].nil?
            set = nil
          else
            set = parsed_json["set"].to_json
            set = Set.new(set)
          end
          map = parsed_json["map"]
          bigint = parsed_json["bigint"]
          new(
            string: string,
            integer: integer,
            long: long,
            double: double,
            bool: bool,
            datetime: datetime,
            date: date,
            uuid: uuid,
            base_64: base_64,
            list: list,
            set: set,
            map: map,
            bigint: bigint,
            additional_properties: struct
          )
        end

        # Serialize an instance of ObjectWithOptionalField to a JSON object
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
          obj.string&.is_a?(String) != false || raise("Passed value for field obj.string is not the expected type, validation failed.")
          obj.integer&.is_a?(Integer) != false || raise("Passed value for field obj.integer is not the expected type, validation failed.")
          obj.long&.is_a?(Long) != false || raise("Passed value for field obj.long is not the expected type, validation failed.")
          obj.double&.is_a?(Float) != false || raise("Passed value for field obj.double is not the expected type, validation failed.")
          obj.bool&.is_a?(Boolean) != false || raise("Passed value for field obj.bool is not the expected type, validation failed.")
          obj.datetime&.is_a?(DateTime) != false || raise("Passed value for field obj.datetime is not the expected type, validation failed.")
          obj.date&.is_a?(Date) != false || raise("Passed value for field obj.date is not the expected type, validation failed.")
          obj.uuid&.is_a?(String) != false || raise("Passed value for field obj.uuid is not the expected type, validation failed.")
          obj.base_64&.is_a?(String) != false || raise("Passed value for field obj.base_64 is not the expected type, validation failed.")
          obj.list&.is_a?(Array) != false || raise("Passed value for field obj.list is not the expected type, validation failed.")
          obj.set&.is_a?(Set) != false || raise("Passed value for field obj.set is not the expected type, validation failed.")
          obj.map&.is_a?(Hash) != false || raise("Passed value for field obj.map is not the expected type, validation failed.")
          obj.bigint&.is_a?(String) != false || raise("Passed value for field obj.bigint is not the expected type, validation failed.")
        end
      end
    end
  end
end
