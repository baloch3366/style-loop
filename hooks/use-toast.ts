import * as React from "react"
import type { ToastVariant, ToastActionElement } from "@/components/ui/toast"

export type ToastProps = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  variant?: ToastVariant
}

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 5000 

type ActionType = {
  type: "ADD_TOAST" | "UPDATE_TOAST" | "DISMISS_TOAST" | "REMOVE_TOAST"
  toast?: ToastProps
  toastId?: string
}

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

const toastTimeouts = new Map<string, NodeJS.Timeout>()

const reducer = (state: ToastProps[], action: ActionType): ToastProps[] => {
  switch (action.type) {
    case "ADD_TOAST":
      return [action.toast!, ...state].slice(0, TOAST_LIMIT)
    case "UPDATE_TOAST":
      return state.map((t) => (t.id === action.toast?.id ? { ...t, ...action.toast } : t))
    case "DISMISS_TOAST": {
      const { toastId } = action
      if (toastId) {
        toastTimeouts.set(
          toastId,
          setTimeout(() => {
            toastTimeouts.delete(toastId)
            dispatch({ type: "REMOVE_TOAST", toastId })
          }, TOAST_REMOVE_DELAY)
        )
      }
      return state.map((t) =>
        t.id === toastId || toastId === undefined
          ? { ...t, open: false }
          : t
      )
    }
    case "REMOVE_TOAST":
      return state.filter((t) => t.id !== action.toastId)
    default:
      return state
  }
}

const listeners: ((state: ToastProps[]) => void)[] = []

let memoryState: ToastProps[] = []

function dispatch(action: ActionType) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => listener(memoryState))
}

export function toast(props: Omit<ToastProps, "id">) {
  const id = genId()
  
  const update = (props: ToastProps) =>
    dispatch({ type: "UPDATE_TOAST", toast: { ...props, id } })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: { ...props, id },
  })

  return { id, dismiss, update }
}

export function useToast() {
  const [state, setState] = React.useState<ToastProps[]>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) listeners.splice(index, 1)
    }
  }, [state])

  return {
    toasts: state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}