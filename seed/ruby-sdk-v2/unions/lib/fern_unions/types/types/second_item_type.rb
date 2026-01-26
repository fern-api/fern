# frozen_string_literal: true

module FernUnions
  module Types
    module Types
      class SecondItemType < Internal::Types::Model
        field :type, -> { String }, optional: true, nullable: false
        field :title, -> { String }, optional: false, nullable: false
      end
    end
  end
end
