
module Seed
    module Service
        class GetMetadataRequest
            field :shallow, , optional: true, nullable: false
            field :tag, , optional: true, nullable: false
            field :x_api_version, , optional: false, nullable: false
        end
    end
end
