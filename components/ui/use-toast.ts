"use client";

import * as React from "react";
import { v4 as uuidv4 } from 'uuid'; // For unique IDs
import { ToastProps } from "./toast"; // Assuming ToastProps is exported from toast.tsx

const TOAST_LIMIT = 1; // You can adjust this limit
const TOAST_REMOVE_DELAY = 1000000; // Time in milliseconds before a toast is removed, adjust as needed

type ToastsState = {
  toasts: ToastProps[];
};

type Action =
  | {
      type: "ADD_TOAST";
      toast: ToastProps;
    }
  | {
      type: "UPDATE_TOAST";
      toast: ToastProps;
    }
  | {
      type: "DISMISS_TOAST";
      toastId?: string;
    }
  | {
      type: "REMOVE_TOAST";
      toastId?: string;
    };

let count = 0;

function generateId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

const reducer = (state: ToastsState, action: Action): ToastsState => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t,
        ),
      };

    case "DISMISS_TOAST":
      const { toastId } = action;
      // ! Side effect ! - This will be executed only on the client
      if (toastId) {
        // Set the 'open' property to false for the toast with the given ID
        return {
          ...state,
          toasts: state.toasts.map((toast) =>
            toast.id === toastId
              ? {
                  ...toast,
                  open: false,
                }
              : toast,
          ),
        };
      }
      return state;

    case "REMOVE_TOAST":
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
    default:
      return state;
  }
};

const listeners: Array<(state: ToastsState) => void> = [];

let memoryState: ToastsState = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => listener(memoryState));
}

type Toast = Omit<ToastProps, "id"> & {
  id?: string;
};

function toast({ ...props }: Toast) {
  const id = generateId();

  const update = (props: ToastProps) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    });
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  return {
    id,
    dismiss,
    update,
  };
}

function useToast() {
  const [state, setState] = React.useState<ToastsState>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}

export { useToast, toast };