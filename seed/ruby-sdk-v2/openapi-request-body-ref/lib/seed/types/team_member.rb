# frozen_string_literal: true

require_relative ".."

module Seed
  module Types
    class TeamMember < Internal::Types::Model
      field :id, -> { String }, optional: false, nullable: false

      field :given_name, -> { String }, optional: true, nullable: false

      field :family_name, -> { String }, optional: true, nullable: false
    end
  end
end
