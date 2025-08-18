
module Seed
    module Service
        class GetResourceRequest
            field :resource_id, String, optional: false, nullable: false
            field :include_metadata, Internal::Types::Boolean, optional: false, nullable: false
            field :format, String, optional: false, nullable: false

    end
end
