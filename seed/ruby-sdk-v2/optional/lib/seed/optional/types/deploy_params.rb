# frozen_string_literal: true

module Seed
  module Optional
    module Types
      class DeployParams < Internal::Types::Model
        field :action_id, -> { String }, optional: false, nullable: false, api_name: "actionId"
        field :id, -> { String }, optional: false, nullable: false
        field :update_draft, -> { Internal::Types::Boolean }, optional: true, nullable: false, api_name: "updateDraft"
      end
    end
  end
end
