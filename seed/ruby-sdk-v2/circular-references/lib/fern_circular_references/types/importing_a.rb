# frozen_string_literal: true

module FernCircularReferences
  module Types
    class ImportingA < Internal::Types::Model
      field :a, -> { FernCircularReferences::A::Types::A }, optional: true, nullable: false
    end
  end
end
