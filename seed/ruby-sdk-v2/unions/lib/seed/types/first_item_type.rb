# frozen_string_literal: true

module Seed
  module Types
    class FirstItemType < Internal::Types::Model
      field :type, -> { Seed::Types::FirstItemTypeType }, optional: true, nullable: false
      field :name, -> { String }, optional: false, nullable: false
    end
  end
end
