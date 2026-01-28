# frozen_string_literal: true

module FernExamples
  module Types
    class Identifier < Internal::Types::Model
      field :type, -> { FernExamples::Types::Type }, optional: false, nullable: false
      field :value, -> { String }, optional: false, nullable: false
      field :label, -> { String }, optional: false, nullable: false
    end
  end
end
