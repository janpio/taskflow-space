import { Dialog, Transition } from "@headlessui/react";
import { type Task } from "@prisma/client";
import { Field, Form, Formik, type FieldProps } from "formik";
import { type Dispatch, Fragment, type SetStateAction, useState } from "react";
import { FiX } from "react-icons/fi";
import { MdDelete } from "react-icons/md";
import isEqual from "lodash.isequal";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { api } from "~/utils/api";
import { UpdateTaskSchema } from "~/utils/ValidationSchema";
import PrimaryButton from "../PrimaryButton";
import Toast from "../Toast";

export default function TaskModal({
  children,
  task,
}: {
  children: React.ReactNode;
  task: Task;
}) {
  const [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }
  const utils = api.useContext();

  const UpdateMutation = api.board.updateTask.useMutation({
    onError(error) {
      Toast({ content: error.message, status: "error" });
    },
    onSuccess: async () => {
      // TODO: optimistically update the UI
      await utils.board.getTasks
        .invalidate({ listId: task.listId })
        .catch((err) => console.log(err));
      Toast({ content: "Task updated successfully!", status: "success" });
      // setIsOpen(false);
    },
  });
  const initialValues = {
    taskId: task.id,
    title: task.title,
    description: task.description || "",
  };

  return (
    <>
      {children ? (
        <div onClick={openModal}>{children}</div>
      ) : (
        <button
          type="button"
          onClick={openModal}
          className="rounded-md bg-white bg-opacity-20 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
        >
          Open Task Modal
        </button>
      )}

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Formik
                    initialValues={initialValues}
                    validationSchema={toFormikValidationSchema(
                      UpdateTaskSchema
                    )}
                    onSubmit={(values) => {
                      UpdateMutation.mutate(values);
                    }}
                  >
                    <Form>
                      <Dialog.Title
                        as="h3"
                        className="flex items-start justify-between gap-5 text-2xl font-medium leading-8 text-gray-900 "
                      >
                        <Field name="title">
                          {({ field, meta }: FieldProps) => (
                            <div className="w-full">
                              <textarea
                                id="title"
                                required
                                placeholder="Task title"
                                {...field}
                                className="active:border-1  block w-full resize-none rounded-xl border-none p-3 text-2xl text-neutral-800 transition-all focus:outline-none focus:outline"
                              />
                              {meta.touched && meta.error && (
                                <p className="mt-2 ml-2 text-sm text-red-500">
                                  {meta.error}
                                </p>
                              )}
                            </div>
                          )}
                        </Field>
                        <button
                          onClick={closeModal}
                          type="button"
                          className="rounded-lg p-2 text-xs text-inherit transition-all  hover:bg-neutral-500 hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-10"
                          aria-controls="navbar-default"
                          aria-expanded="false"
                        >
                          <span className="sr-only">Close Task Modal</span>
                          <FiX size="2em" />
                        </button>
                      </Dialog.Title>
                      <div className="my-4 px-3">
                        <p className="text-sm text-gray-500">
                          {task?.createdAt?.toLocaleDateString()}
                        </p>
                      </div>
                      <Field name="description">
                        {({ field, meta }: FieldProps) => (
                          <>
                            <textarea
                              id="description"
                              required
                              placeholder="Task description"
                              {...field}
                              className="text-md block w-full  resize-none rounded-xl border-2 border-gray-300 p-3 text-neutral-800 transition-all focus:outline-none focus:outline"
                              rows={8}
                            />
                            {meta.touched && meta.error && (
                              <p className="mt-2 ml-2 text-sm text-red-500">
                                {meta.error}
                              </p>
                            )}
                          </>
                        )}
                      </Field>

                      <div className="mt-4 flex items-center justify-between">
                        <DeleteTask task={task} setIsOpen={setIsOpen} />
                        <Field name="submit">
                          {({ form }: FieldProps) => (
                            <>
                              <Transition
                                show={
                                  form.dirty &&
                                  !isEqual(form.values, initialValues)
                                }
                                enter="transition-opacity duration-75"
                                enterFrom="opacity-0"
                                enterTo="opacity-100"
                                leave="transition-opacity duration-150"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                              >
                                <PrimaryButton
                                  isLoading={UpdateMutation.isLoading}
                                  loadingText="Saving Changes..."
                                  className="rounded-xl"
                                >
                                  Save Changes
                                </PrimaryButton>
                              </Transition>
                            </>
                          )}
                        </Field>
                      </div>
                    </Form>
                  </Formik>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

function DeleteTask({
  task,
  setIsOpen,
}: {
  task: Task;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const utils = api.useContext();
  const deleteMutation = api.board.deleteTask.useMutation({
    onError(error) {
      Toast({ content: error.message, status: "error" });
    },
    onSuccess: async () => {
      // TODO: optimistically update the UI
      await utils.board.getTasks
        .invalidate({ listId: task.listId })
        .catch((err) => console.log(err));
      Toast({ content: "Task deleted successfully!", status: "success" });
      setIsOpen(false);
    },
  });
  return (
    <PrimaryButton
      type="button"
      isLoading={deleteMutation.isLoading}
      onClick={() => deleteMutation.mutate({ taskId: task.id })}
      LeftIcon={MdDelete}
      loadingText="Deleting Task"
      overwriteClassname
      className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
    >
      Delete Task
    </PrimaryButton>
  );
}
