# frozen_string_literal: true

module Seed
  module Types
    class Inlined < Internal::Types::Model
      field :unique, -> { String }, optional: false, nullable: false

      field :name, -> { String }, optional: false, nullable: false

      field :docs, -> { String }, optional: false, nullable: false
    end
  end
end
