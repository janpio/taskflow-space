import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Transition } from "@headlessui/react";
import { Board, type List } from "@prisma/client";
import { Field, Form, Formik, type FieldProps } from "formik";
import { memo } from "react";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { api } from "~/utils/api";
import {
  CreateListSchema,
  CreateTaskSchema,
  RenameListSchema,
  UpdateListSchema,
} from "~/utils/ValidationSchema";
import PrimaryButton from "../Global/PrimaryButton";
import Toast from "../Global/Toast";
import { EmptyListCard, TaskCard } from "./TaskCard";
import { Menu } from "@headlessui/react";
import { Fragment } from "react";
import { BiDotsVerticalRounded } from "react-icons/bi";

export const LIST_BG_COLOR = "#ebecf0";

function TaskList({ list }: { list: List }) {
  const { data: Tasks, isLoading } = api.board.getTasks.useQuery(
    { listId: list.id || "" },
    { enabled: Boolean(list.id), retry: false }
  );

  console.log("rerendering", list.name);
  const { setNodeRef } = useDroppable({ id: list.id });

  if (isLoading) {
    return <div>loading...</div>;
  }

  return (
    <div
      className="h-full rounded-xl border-2 bg-white/90"
      key={`main:${list.name}`}
    >
      <div className="sticky top-0 z-10 flex justify-between rounded-t-xl px-3 pt-3 pb-2">
        <UpdateListName list={list} />
        <ListActionMenu list={list} />
      </div>
      <div
        className="relative pb-3"
        key={list.name}
        //  bg={LIST_BG_COLOR}
      >
        <SortableContext
          items={Tasks || []}
          strategy={verticalListSortingStrategy}
        >
          <div
            className="listScrollbar max-h-[75vh] space-y-4 overflow-y-scroll pb-2"
            ref={setNodeRef}
          >
            {Tasks?.length !== 0 ? (
              Tasks?.map((task) => (
                <TaskCard key={task.id} id={task.id} task={task} />
              ))
            ) : (
              <EmptyListCard />
            )}
          </div>
        </SortableContext>
      </div>
      <AddToListForm list={list} />
    </div>
  );
}
export default memo(TaskList);

export function AddToListForm({ list }: { list: List }) {
  // createTask mutation
  const utils = api.useContext();
  const mutation = api.board.createTask.useMutation({
    onError(error) {
      Toast({ content: error.message, status: "error" });
    },
    onSuccess: async () => {
      await utils.board.getTasks
        .invalidate({ listId: list.id })
        .catch((err) => console.log(err));
      Toast({ content: "TEMP:Added Task Successfully", status: "success" });
    },
  });
  return (
    <div className="sticky bottom-0 z-10 rounded-b-xl p-2">
      <Formik
        initialValues={{ title: "", listId: list.id }}
        validationSchema={toFormikValidationSchema(CreateTaskSchema)}
        onSubmit={(values, { resetForm }) => {
          mutation.mutate(values);
          resetForm();
        }}
      >
        <Form>
          <div className="flex w-full max-w-[310px] items-center gap-2">
            <Field name="title">
              {({ field, form, meta }: FieldProps) => (
                <input
                  className="w-full flex-[10] rounded-xl border-gray-200 bg-white py-3 px-5"
                  type="text"
                  placeholder="Add to list"
                  id="title"
                  required
                  {...field}
                />
              )}
            </Field>
            <Field name="submit">
              {({ form }: FieldProps) => (
                <Transition
                  show={form.dirty}
                  enter="transition-opacity duration-75"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="transition-opacity duration-150"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <PrimaryButton
                    isLoading={mutation.isLoading}
                    loadingText=" "
                    disabled={
                      Object.keys(form.errors).length !== 0 ||
                      mutation.isLoading
                    }
                    type="submit"
                    className="flex-[2] rounded-xl"
                    // LeftIcon={FaPlus}
                  >
                    Add
                  </PrimaryButton>
                </Transition>
              )}
            </Field>
          </div>
          <Field name="title">
            {({ form, meta }: FieldProps) => (
              <>
                {form.dirty && meta.touched && meta.error && (
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

export function ListActionMenu({ list }: { list: List }) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex justify-center rounded-md bg-neutral-100 bg-opacity-30  p-2 text-sm font-medium text-white transition-opacity hover:bg-opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-opacity-75">
          <BiDotsVerticalRounded
            className="h-5 w-5 text-black"
            aria-hidden="true"
          />
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-1 py-1 ">
            <Menu.Item>
              {/* TODO: make functionality */}
              <button className="flex w-full items-center rounded-md bg-white px-2 py-2 text-sm text-black hover:bg-red-100">
                Delete list
              </button>
            </Menu.Item>
            <Menu.Item>
              {/* TODO: make functionality */}
              <button className="flex w-full items-center rounded-md bg-white px-2 py-2 text-sm text-black hover:bg-neutral-100">
                Clear all tasks
              </button>
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

export function UpdateListName({ list }: { list: List }) {
  const mutation = api.board.updateList.useMutation({
    onError(error) {
      Toast({ content: error.message, status: "error" });
    },
    onSuccess: () => {
      Toast({ content: "List renamed successfully!", status: "success" });
    },
  });

  return (
    <Formik
      initialValues={{ name: list.name, listId: list.id }}
      validationSchema={toFormikValidationSchema(UpdateListSchema)}
      onSubmit={(values) => {
        mutation.mutate(values);
      }}
    >
      <Form>
        <Field name="name">
          {({ field, form, meta }: FieldProps) => (
            <input
              className="border-neutral-400 bg-transparent px-2 pb-1 font-bold outline-none hover:border-b-2 focus:border-b-2 active:border-none"
              {...field}
            />
          )}
        </Field>
      </Form>
    </Formik>
  );
}

export function CreateList({ boardId }: { boardId: string }) {
  const utils = api.useContext();

  const mutation = api.board.createList.useMutation({
    onError(error) {
      Toast({ content: error.message, status: "error" });
    },
    onSuccess: (newList) => {
      utils.board.getBoard.setData({ boardId }, (prev) => {
        return { ...prev, lists: [...prev.lists, newList] };
      });
      Toast({ content: "List Created successfully!", status: "success" });
    },
  });

  return (
    <div className="pr-10">
      <div className="h-fit min-w-[310px] rounded-xl border-2 bg-white/90">
        <div className="sticky bottom-0 z-10 rounded-b-xl p-2">
          <Formik
            initialValues={{ name: "", boardId: boardId }}
            validationSchema={toFormikValidationSchema(CreateListSchema)}
            onSubmit={(values, { resetForm }) => {
              mutation.mutate(values);
              resetForm();
            }}
          >
            <Form>
              <div className="flex w-full max-w-[310px] items-center gap-2">
                <Field name="name">
                  {({ field, form, meta }: FieldProps) => (
                    <input
                      className="w-full flex-[10] rounded-xl border-gray-200 bg-white py-3 px-5"
                      type="text"
                      placeholder="Create new list"
                      id="name"
                      required
                      {...field}
                    />
                  )}
                </Field>
                <Field name="submit">
                  {({ form }: FieldProps) => (
                    <Transition
                      show={form.dirty}
                      enter="transition-opacity duration-75"
                      enterFrom="opacity-0"
                      enterTo="opacity-100"
                      leave="transition-opacity duration-150"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <PrimaryButton
                        isLoading={mutation.isLoading}
                        loadingText=" "
                        disabled={
                          Object.keys(form.errors).length !== 0 ||
                          mutation.isLoading
                        }
                        type="submit"
                        className="flex-[2] rounded-xl"
                        // LeftIcon={FaPlus}
                      >
                        Create
                      </PrimaryButton>
                    </Transition>
                  )}
                </Field>
              </div>
              <Field name="name">
                {({ form, meta }: FieldProps) => (
                  <Transition
                    show={form.dirty && meta.touched && Boolean(meta.error)}
                    enter="transition-opacity duration-75"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-opacity duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <p className="mt-2 ml-2 text-sm text-red-500">
                      {meta.error}
                    </p>
                  </Transition>
                )}
              </Field>
            </Form>
          </Formik>
        </div>
      </div>
    </div>
  );
}
