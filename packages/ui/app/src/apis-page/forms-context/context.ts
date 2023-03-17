import { createContextedFormDialogsProvider } from "@fern-api/contexted-dialog";
import {
    CreateEnvironmentFormDialogProviderRenderer,
    INITIAL_ENVIRONMENT_FORM_STATE,
} from "../tabs/environments/create-environments-form/CreateEnvironmentFormProviderRenderer";

export const { ContextedFormDialogsProvider: ApisPageContextedFormDialogsProvider, useOpenCreateEnvironmentForm } =
    createContextedFormDialogsProvider({
        createEnvironment: {
            initialFormState: INITIAL_ENVIRONMENT_FORM_STATE,
            Renderer: CreateEnvironmentFormDialogProviderRenderer,
        },
    });
