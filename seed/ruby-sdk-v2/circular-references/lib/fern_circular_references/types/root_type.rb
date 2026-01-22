# frozen_string_literal: true

module FernCircularReferences
  module Types
    class RootType < Internal::Types::Model
      field :s, -> { String }, optional: false, nullable: false
    end
  end
end
