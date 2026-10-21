# frozen_string_literal: true

require_relative "../../seed"

module Seed
  module Types
    class Organization < Internal::Types::Model
      field :name, -> { String }, optional: false, nullable: false

      field :id, -> { String }, optional: false, nullable: false

      field :metadata, -> { Seed::Types::BaseOrgMetadata }, optional: true, nullable: false
    end
  end
end
