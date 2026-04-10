# frozen_string_literal: true

module Seed
  module Types
    class SecondItemType < Internal::Types::Model
      field :type, -> { Seed::Types::SecondItemTypeType }, optional: true, nullable: false
      field :title, -> { String }, optional: false, nullable: false
    end
  end
end
