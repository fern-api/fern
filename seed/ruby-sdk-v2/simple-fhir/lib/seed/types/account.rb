# frozen_string_literal: true

module Seed
  module Types
    class Account < Internal::Types::Model
      field :resource_type, -> { String }, optional: false, nullable: false
      field :name, -> { String }, optional: false, nullable: false
      field :patient, -> { Seed::Types::Patient }, optional: true, nullable: false
      field :practitioner, -> { Seed::Types::Practitioner }, optional: true, nullable: false
    end
  end
end
