# frozen_string_literal: true

module FernUnions
  module Types
    module Types
      class FirstItemType < Internal::Types::Model
        field :type, -> { String }, optional: true, nullable: false
        field :name, -> { String }, optional: false, nullable: false
      end
    end
  end
end
