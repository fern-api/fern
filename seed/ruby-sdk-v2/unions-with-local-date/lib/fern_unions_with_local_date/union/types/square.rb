# frozen_string_literal: true

module FernUnionsWithLocalDate
  module Union
    module Types
      class Square < Internal::Types::Model
        field :length, -> { Integer }, optional: false, nullable: false
      end
    end
  end
end
