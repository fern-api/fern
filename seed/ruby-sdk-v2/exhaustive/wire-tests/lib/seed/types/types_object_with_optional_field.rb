# frozen_string_literal: true

module Seed
  module Types
    class TypesObjectWithOptionalField < Internal::Types::Model
      field :string, -> { String }, optional: true, nullable: false
      field :integer, -> { Integer }, optional: true, nullable: false
      field :long, -> { Integer }, optional: true, nullable: false
      field :double, -> { Integer }, optional: true, nullable: false
      field :bool, -> { Internal::Types::Boolean }, optional: true, nullable: false
      field :datetime, -> { String }, optional: true, nullable: false
      field :date, -> { String }, optional: true, nullable: false
      field :uuid, -> { String }, optional: true, nullable: false
      field :base64, -> { String }, optional: true, nullable: false
      field :list, -> { Internal::Types::Array[String] }, optional: true, nullable: false
      field :set, -> { Internal::Types::Array[String] }, optional: true, nullable: false
      field :map, -> { Internal::Types::Hash[String, String] }, optional: true, nullable: false
      field :bigint, -> { Integer }, optional: true, nullable: false
    end
  end
end
