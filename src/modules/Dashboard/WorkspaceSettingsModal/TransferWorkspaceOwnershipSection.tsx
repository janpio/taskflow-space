import { type Workspace } from "@prisma/client";
import { Field, Form, Formik, type FieldProps } from "formik";
import { type Dispatch, type SetStateAction } from "react";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { api } from "~/utils/api";
import { TransferWorkspaceOwnershipSchema } from "~/utils/ValidationSchema";
import PrimaryButton from "../../Global/PrimaryButton";
import Toast from "../../Global/Toast";

function RenameWorkspaceSection({
  workspace,
  setIsOpen,
}: {
  workspace: Workspace;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const utils = api.useContext();
  const mutation = api.dashboard.transferWorkspaceOwnership.useMutation({
    onError(error) {
      Toast({ content: error.message, status: "error" });
    },
    onSuccess: async () => {
      await utils.dashboard.getAllWorkspace
        .invalidate()
        .catch((err) => console.log(err));
      Toast({
        content: "Workspace transfered successfully!",
        status: "success",
      });
      setIsOpen(false);
    },
  });

  return (
    <div className="mt-2 space-y-3">
      <p className="text-md font-medium text-neutral-600 dark:text-white">
        Transfer Workspace Ownership
      </p>
      <p className="">After transfer you will become admin of the workspace.</p>
      <Formik
        initialValues={{ email: "", workspaceId: workspace.id }}
        validationSchema={toFormikValidationSchema(
          TransferWorkspaceOwnershipSchema
        )}
        onSubmit={(values) => {
          mutation.mutate(values);
        }}
      >
        <Form>
          <Field name="email">
            {({ field, form, meta }: FieldProps) => (
              <>
                <label
                  htmlFor="email"
                  className="mt-3 mb-2 block text-sm font-medium text-neutral-500 dark:text-white"
                >
                  New owner email
                </label>
                <div className="flex flex-row items-center justify-center gap-2">
                  <input
                    type="email"
                    id="email"
                    required
                    placeholder="name@company.com"
                    {...field}
                    className="text-md  block w-full rounded-xl   p-3 text-neutral-800 transition-all focus:outline-none focus:outline"
                  />
                  <PrimaryButton
                    isLoading={mutation.isLoading}
                    disabled={
                      !form.dirty || Object.keys(form.errors).length !== 0
                    }
                    overwriteClassname
                    loadingText="Transfer..."
                    className="rounded-xl border-2 border-red-600 bg-transparent px-4 py-2 text-red-700 hover:bg-red-50 active:bg-red-100
                    disabled:cursor-not-allowed disabled:border-neutral-200 disabled:bg-neutral-100 disabled:text-neutral-400
                    "
                  >
                    Transfer
                  </PrimaryButton>
                </div>
                {meta.touched && meta.error && (
                  <p className="mt-2 ml-2 text-sm text-red-500">{meta.error}</p>
                )}
              </>
            )}
          </Field>
        </Form>
      </Formik>
    </div>
  );
}

export default RenameWorkspaceSection;