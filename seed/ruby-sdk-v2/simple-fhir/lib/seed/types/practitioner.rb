# frozen_string_literal: true

module Seed
  module Types
    class Practitioner < Internal::Types::Model
      field :resource_type, -> { String }, optional: false, nullable: false
      field :name, -> { String }, optional: false, nullable: false
    end
  end
end
