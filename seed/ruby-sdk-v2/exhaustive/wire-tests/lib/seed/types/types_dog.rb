# frozen_string_literal: true

module Seed
  module Types
    class TypesDog < Internal::Types::Model
      field :name, -> { String }, optional: false, nullable: false
      field :likes_to_woof, -> { Internal::Types::Boolean }, optional: false, nullable: false, api_name: "likesToWoof"
    end
  end
end
