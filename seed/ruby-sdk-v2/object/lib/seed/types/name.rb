# frozen_string_literal: true

require_relative ".."

module Seed
  module Types
    class Name < Internal::Types::Model
      field :id, -> { String }, optional: false, nullable: false

      field :value, -> { String }, optional: false, nullable: false
    end
  end
end
