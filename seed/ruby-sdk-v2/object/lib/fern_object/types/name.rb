# frozen_string_literal: true

module FernObject
  module Types
    class Name < Internal::Types::Model
      field :id, -> { String }, optional: false, nullable: false
      field :value, -> { String }, optional: false, nullable: false
    end
  end
end
