# frozen_string_literal: true

require "set"
require_relative "types/Name"
require "json"

module SeedClient
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
    # @param fifteen [Array<Array<Integer>>]
    # @param sixteen [Array<Hash{String => String}>]
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
      # @type [Array<Array<Integer>>]
      @fifteen = fifteen
      # @type [Array<Hash{String => String}>]
      @sixteen = sixteen
      # @type [Array<UUID>]
      @seventeen = seventeen
      # @type [String]
      @eighteen = eighteen
      # @type [Name]
      @nineteen = nineteen
      # @type [OpenStruct]
      @additional_properties = additional_properties
    end

    # Deserialize a JSON object to an instance of Type
    #
    # @param json_object [JSON]
    # @return [Type]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      one = struct.one
      two = struct.two
      three = struct.three
      four = struct.four
      five = struct.five
      six = struct.six
      seven = struct.seven
      eight = struct.eight
      nine = struct.nine
      ten = struct.ten
      eleven = Set.new(struct.eleven)
      twelve = struct.twelve
      thirteen = struct.thirteen
      fourteen = struct.fourteen
      fifteen = struct.fifteen
      sixteen = struct.sixteen
      seventeen = struct.seventeen
      eighteen = struct.eighteen
      nineteen = Name.from_json(json_object: struct.nineteen)
      new(one: one, two: two, three: three, four: four, five: five, six: six, seven: seven, eight: eight, nine: nine,
          ten: ten, eleven: eleven, twelve: twelve, thirteen: thirteen, fourteen: fourteen, fifteen: fifteen, sixteen: sixteen, seventeen: seventeen, eighteen: eighteen, nineteen: nineteen, additional_properties: struct)
    end

    # Serialize an instance of Type to a JSON object
    #
    # @return [JSON]
    def to_json(*_args)
      {
        one: @one,
        two: @two,
        three: @three,
        four: @four,
        five: @five,
        six: @six,
        seven: @seven,
        eight: @eight,
        nine: @nine,
        ten: @ten,
        eleven: @eleven.to_a,
        twelve: @twelve,
        thirteen: @thirteen,
        fourteen: @fourteen,
        fifteen: @fifteen,
        sixteen: @sixteen,
        seventeen: @seventeen,
        eighteen: @eighteen,
        nineteen: @nineteen
      }.to_json
    end
  end
end
