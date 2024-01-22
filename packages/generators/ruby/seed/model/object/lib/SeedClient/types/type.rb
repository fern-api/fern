# frozen_string_literal: true

require "set"
require_relative "types/Name"
require "json"

module SeedClient
  # Exercises all of the built-in types.
  class Type
    attr_reader :one, :two, :three, :four, :five, :six, :seven, :eight, :nine, :ten, :eleven, :twelve, :thirteen,
                :fourteen, :fifteen, :sixteen, :seventeen, :eighteen, :nineteen, :additional_properties

    # @param one [Integer]
    # @param two [Float]
    # @param three [String]
    # @param four [Boolean]
    # @param five [Long]
    # @param six [DateTime]
    # @param seven [Date]
    # @param eight [UUID]
    # @param nine [String]
    # @param ten [Array<Integer>]
    # @param eleven [Set<Float>]
    # @param twelve [Hash{String => String}]
    # @param thirteen [Long]
    # @param fourteen [Object]
    # @param fifteen [Array<Array>]
    # @param sixteen [Array<Hash>]
    # @param seventeen [Array<UUID>]
    # @param eighteen [String]
    # @param nineteen [Name]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [Type]
    def initialze(one:, two:, three:, four:, five:, six:, seven:, eight:, nine:, ten:, eleven:, twelve:, fourteen:,
                  fifteen:, sixteen:, seventeen:, eighteen:, nineteen:, thirteen: nil, additional_properties: nil)
      # @type [Integer]
      @one = one
      # @type [Float]
      @two = two
      # @type [String]
      @three = three
      # @type [Boolean]
      @four = four
      # @type [Long]
      @five = five
      # @type [DateTime]
      @six = six
      # @type [Date]
      @seven = seven
      # @type [UUID]
      @eight = eight
      # @type [String]
      @nine = nine
      # @type [Array<Integer>]
      @ten = ten
      # @type [Set<Float>]
      @eleven = eleven
      # @type [Hash{String => String}]
      @twelve = twelve
      # @type [Long]
      @thirteen = thirteen
      # @type [Object]
      @fourteen = fourteen
      # @type [Array<Array>]
      @fifteen = fifteen
      # @type [Array<Hash>]
      @sixteen = sixteen
      # @type [Array<UUID>]
      @seventeen = seventeen
      # @type [String]
      @eighteen = eighteen
      # @type [Name]
      @nineteen = nineteen
      # @type [OpenStruct] Additional properties unmapped to the current class definition
      @additional_properties = additional_properties
    end

    # Deserialize a JSON object to an instance of Type
    #
    # @param json_object [JSON]
    # @return [Type]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      one struct.one
      two struct.two
      three struct.three
      four struct.four
      five struct.five
      six struct.six
      seven struct.seven
      eight struct.eight
      nine struct.nine
      ten struct.ten
      eleven Set.new(struct.eleven)
      twelve struct.twelve
      thirteen struct.thirteen
      fourteen struct.fourteen
      fifteen struct.fifteen
      sixteen struct.sixteen
      seventeen struct.seventeen
      eighteen struct.eighteen
      nineteen Name.from_json(json_object: struct.nineteen)
      new(one: one, two: two, three: three, four: four, five: five, six: six, seven: seven, eight: eight, nine: nine,
          ten: ten, eleven: eleven, twelve: twelve, thirteen: thirteen, fourteen: fourteen, fifteen: fifteen, sixteen: sixteen, seventeen: seventeen, eighteen: eighteen, nineteen: nineteen, additional_properties: struct)
    end

    # Serialize an instance of Type to a JSON object
    #
    # @return [JSON]
    def to_json(*_args)
      { one: @one, two: @two, three: @three, four: @four, five: @five, six: @six, seven: @seven, eight: @eight,
        nine: @nine, ten: @ten, eleven: @eleven.to_a, twelve: @twelve, thirteen: @thirteen, fourteen: @fourteen, fifteen: @fifteen, sixteen: @sixteen, seventeen: @seventeen, eighteen: @eighteen, nineteen: @nineteen }.to_json
    end

    # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
    #
    # @param obj [Object]
    # @return [Void]
    def self.validate_raw(obj:)
      obj.one.is_a?(Integer) != false || raise("Passed value for field obj.one is not the expected type, validation failed.")
      obj.two.is_a?(Float) != false || raise("Passed value for field obj.two is not the expected type, validation failed.")
      obj.three.is_a?(String) != false || raise("Passed value for field obj.three is not the expected type, validation failed.")
      obj.four.is_a?(Boolean) != false || raise("Passed value for field obj.four is not the expected type, validation failed.")
      obj.five.is_a?(Long) != false || raise("Passed value for field obj.five is not the expected type, validation failed.")
      obj.six.is_a?(DateTime) != false || raise("Passed value for field obj.six is not the expected type, validation failed.")
      obj.seven.is_a?(Date) != false || raise("Passed value for field obj.seven is not the expected type, validation failed.")
      obj.eight.is_a?(UUID) != false || raise("Passed value for field obj.eight is not the expected type, validation failed.")
      obj.nine.is_a?(String) != false || raise("Passed value for field obj.nine is not the expected type, validation failed.")
      obj.ten.is_a?(Array) != false || raise("Passed value for field obj.ten is not the expected type, validation failed.")
      obj.eleven.is_a?(Set) != false || raise("Passed value for field obj.eleven is not the expected type, validation failed.")
      obj.twelve.is_a?(Hash) != false || raise("Passed value for field obj.twelve is not the expected type, validation failed.")
      obj.thirteen&.is_a?(Long) != false || raise("Passed value for field obj.thirteen is not the expected type, validation failed.")
      obj.fourteen.is_a?(Object) != false || raise("Passed value for field obj.fourteen is not the expected type, validation failed.")
      obj.fifteen.is_a?(Array) != false || raise("Passed value for field obj.fifteen is not the expected type, validation failed.")
      obj.sixteen.is_a?(Array) != false || raise("Passed value for field obj.sixteen is not the expected type, validation failed.")
      obj.seventeen.is_a?(Array) != false || raise("Passed value for field obj.seventeen is not the expected type, validation failed.")
      obj.eighteen.is_a?(String) != false || raise("Passed value for field obj.eighteen is not the expected type, validation failed.")
      Name.validate_raw(obj: obj.nineteen)
    end
  end
end
