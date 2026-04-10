# frozen_string_literal: true

module Seed
  module Types
    class V2V3TestCaseMetadata < Internal::Types::Model
      field :id, -> { String }, optional: false, nullable: false
      field :name, -> { String }, optional: false, nullable: false
      field :hidden, -> { Internal::Types::Boolean }, optional: false, nullable: false
    end
  end
end
