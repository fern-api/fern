# frozen_string_literal: true

module Seed
  module Types
    class ObjectPayloadWithEventField < Internal::Types::Model
      field :id, -> { String }, optional: false, nullable: false
      field :name, -> { String }, optional: false, nullable: false
      field :event, -> { String }, optional: false, nullable: false
    end
  end
end
