# frozen_string_literal: true

module Seed
  module Users
    module Types
      class Page < Internal::Types::Model
        field :page, -> { Integer }, optional: false, nullable: false
        field :next_, -> { Seed::Users::Types::NextPage }, optional: true, nullable: false
        field :per_page, -> { Integer }, optional: false, nullable: false
        field :total_page, -> { Integer }, optional: false, nullable: false
      end
    end
  end
end
