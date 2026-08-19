# frozen_string_literal: true

module Seed
  module Types
    class Practitioner < Internal::Types::Model
      field :id, -> { String }, optional: false, nullable: false

      field :related_resources, -> { Internal::Types::Array[Seed::Types::ResourceList] }, optional: false, nullable: false

      field :memo, -> { Seed::Types::Memo }, optional: false, nullable: false

      field :resource_type, -> { String }, optional: false, nullable: false

      field :name, -> { String }, optional: false, nullable: false
    end
  end
end
