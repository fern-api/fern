# frozen_string_literal: true

module FernUnionsWithLocalDate
  module Union
    module Types
      class WithName < Internal::Types::Model
        field :name, -> { String }, optional: false, nullable: false
      end
    end
  end
end
