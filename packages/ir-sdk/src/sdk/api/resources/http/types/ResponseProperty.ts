/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as FernIr from "../../../index";

/**
 * A property associated with a paginated endpoint's request or response.
 */
export interface ResponseProperty {
    /**
     * If empty, the property is defined at the top-level.
     * Otherwise, the property is defined on the nested object identified
     * by the path.
     */
    propertyPath: FernIr.Name[] | undefined;
    property: FernIr.ObjectProperty;
}
