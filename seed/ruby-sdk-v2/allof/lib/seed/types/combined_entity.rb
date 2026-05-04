# frozen_string_literal: true

module Seed
  module Types
    class CombinedEntity < Internal::Types::Model
      field :status, -> { Seed::Types::CombinedEntityStatus }, optional: false, nullable: false

      field :id, -> { String }, optional: false, nullable: false

      field :name, -> { String }, optional: true, nullable: false

      field :summary, -> { String }, optional: true, nullable: false
    end
  end
end
