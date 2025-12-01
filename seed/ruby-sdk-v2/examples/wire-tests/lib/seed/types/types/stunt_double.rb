# frozen_string_literal: true

module Seed
  module Types
    module Types
      class StuntDouble < Internal::Types::Model
        field :name, -> { String }, optional: false, nullable: false
        field :actor_or_actress_id, -> { String }, optional: false, nullable: false, api_name: "actorOrActressId"
      end
    end
  end
end
