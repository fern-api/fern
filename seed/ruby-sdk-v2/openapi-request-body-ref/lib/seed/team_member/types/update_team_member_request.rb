# frozen_string_literal: true

module Seed
  module TeamMember
    module Types
      class UpdateTeamMemberRequest < Internal::Types::Model
        field :team_member_id, -> { String }, optional: false, nullable: false
        field :given_name, -> { String }, optional: true, nullable: false
        field :family_name, -> { String }, optional: true, nullable: false
        field :email_address, -> { String }, optional: true, nullable: false
      end
    end
  end
end
