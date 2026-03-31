# frozen_string_literal: true

module Seed
  module Types
    module Object_
      module Types
        class ObjectWithOptionalField < Internal::Types::Model
          field :string, -> { String }, optional: true, nullable: false
          field :integer, -> { Integer }, optional: true, nullable: false
          field :long, -> { Integer }, optional: true, nullable: false
          field :double, -> { Integer }, optional: true, nullable: false
          field :bool, -> { Internal::Types::Boolean }, optional: true, nullable: false
          field :datetime, -> { String }, optional: true, nullable: false
          field :date, -> { String }, optional: true, nullable: false
          field :uuid, -> { String }, optional: true, nullable: false
          field :base_64, -> { String }, optional: true, nullable: false, api_name: "base64"
          field :list, -> { Internal::Types::Array[String] }, optional: true, nullable: false
          field :set, -> { Internal::Types::Array[String] }, optional: true, nullable: false
          field :map, -> { Internal::Types::Hash[Integer, String] }, optional: true, nullable: false
          field :bigint, -> { String }, optional: true, nullable: false
        end
      end
    end
  end
end
