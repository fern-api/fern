# frozen_string_literal: true

module FernUnionsWithLocalDate
  module Union
    module Types
      class Circle < Internal::Types::Model
        field :radius, -> { Integer }, optional: false, nullable: false
      end
    end
  end
end
